<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerKoppelingen;
use App\Entity\GebruikerMedicijn;
use App\Entity\GebruikerMedicijnGebruik;
use App\Entity\GebruikerMedicijnSchema;
use App\Entity\VoorraadItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/logs')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class GebruikerMedicijnGebruikController extends AbstractController
{
  #[Route('', methods: ['POST'])]
  public function create(Request $request, EntityManagerInterface $em): JsonResponse
  {

    /** @var Gebruikers $currentUser */
    $currentUser = $this->getUser();
    $data = json_decode($request->getContent(), true);

    // 1. Validate gmn_id (Mandatory)
    $gmnId = $data['gmn_id'] ?? null;
    if (!$gmnId) {
      return $this->json(['error' => 'een correct gmn_id is verplicht.'], 400);
    }

    $gebruikerMedicijn = $em->getRepository(GebruikerMedicijn::class)->findOneBy([
      'id' => $gmnId,
      'gebruiker' => $currentUser
    ]);

    if (!$gebruikerMedicijn) {
      return $this->json(['error' => 'Medicijn niet gevonden of u heeft geen rechten.'], 404);
    }

    $log = new GebruikerMedicijnGebruik();
    $log->setGebruikerMedicijn($gebruikerMedicijn);

    // 2. Set Amount
    $log->setMedicijnTurven((int) ($data['medicijn_turven'] ?? 1));

    // 2b. Set Status (Optional)
    $status = $data['status'] ?? GebruikerMedicijnGebruik::STATUS_OP_TIJD;
    if (!in_array($status, [GebruikerMedicijnGebruik::STATUS_OP_TIJD, GebruikerMedicijnGebruik::STATUS_GEMIST], true)) {
      return $this->json(['error' => 'Ongeldige status.'], 400);
    }
    $log->setStatus($status);

    // 3. Validate gms_id (Optional but STRICT if provided)
    if (!empty($data['gms_id'])) {
      $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($data['gms_id']);

      // Strict Check 1: Does it exist?
      if (!$schema) {
        return $this->json(['error' => 'Opgegeven schema (gms_id) bestaat niet.'], 404);
      }

      // Strict Check 2: Does it belong to the same medicine?
      if ($schema->getGebruikerMedicijn() !== $gebruikerMedicijn) {
        return $this->json(['error' => 'Dit schema hoort niet bij het gekozen medicijn.'], 400);
      }

      $log->setGebruikerMedicijnSchema($schema);
    }

    // 4. Set Time
    if (isset($data['aangemaakt_op']) && !empty($data['aangemaakt_op'])) {
      try {
        $log->setAangemaaktOp(new \DateTime($data['aangemaakt_op']));
      } catch (\Exception $e) {
        return $this->json(['error' => 'Ongeldig datumformaat.'], 400);
      }
    }

    $em->persist($log);
    $em->flush();

    // 5. Decrease stock when logged as taken
    if ($log->getStatus() === GebruikerMedicijnGebruik::STATUS_OP_TIJD) {
      $stockItem = $gebruikerMedicijn->getVoorraadItem();
      if ($stockItem instanceof VoorraadItem) {
        $pillsPerStrip = max(1, $stockItem->getPillsPerStrip());
        $total = ($stockItem->getStripsCount() * $pillsPerStrip) + $stockItem->getLoosePills();
        $newTotal = max(0, $total - $log->getMedicijnTurven());

        $stockItem->setStripsCount((int) floor($newTotal / $pillsPerStrip));
        $stockItem->setLoosePills((int) ($newTotal % $pillsPerStrip));

        if ($newTotal <= (int) floor($stockItem->getThreshold() / 2)) {
          $stockItem->setStatus(VoorraadItem::STATUS_BIJNA_LEEG);
        } elseif ($newTotal <= $stockItem->getThreshold()) {
          $stockItem->setStatus(VoorraadItem::STATUS_BIJNA_OP);
        } else {
          $stockItem->setStatus(VoorraadItem::STATUS_OP_PEIL);
        }

        $stockItem->setLastUpdated(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $em->flush();
      }
    }

    return $this->json([
      'message' => 'Turf succesvol opgeslagen.',
      'id' => $log->getId(),
      'aangemaakt_op' => $log->getAangemaaktOp()->format('c')
    ], 201);
  }

  #[Route('', methods: ['GET'])]
  public function index(Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $currentUser */
    $currentUser = $this->getUser();

    // A. Determine Target Patient
    $targetPatientId = $request->query->get('patient_id');
    $targetUser = $currentUser;

    if ($targetPatientId && $targetPatientId !== $currentUser->getId()->toRfc4122()) {
      $connection = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
        'gekoppelde_gebruiker' => $currentUser,
        'gebruiker' => $targetPatientId,
        'status' => GebruikerKoppelingen::STATUS_ACTIVE
      ]);

      if (!$connection) {
        return $this->json(['error' => 'Geen toegang tot gegevens van deze patiënt.'], 403);
      }

      $targetUser = $connection->getGebruiker();
    }

    // B. Build Query
    $qb = $em->createQueryBuilder();
    $qb->select('l', 'gm')
      ->from(GebruikerMedicijnGebruik::class, 'l')
      ->join('l.gebruikerMedicijn', 'gm')
      ->where('gm.gebruiker = :userId')
      ->setParameter('userId', $targetUser->getId(), 'uuid')
      ->orderBy('l.aangemaakt_op', 'DESC');

    // C. Filters
    // by date
    if ($date = $request->query->get('date')) {
      $start = new \DateTime("{$date} 00:00:00");
      $end = new \DateTime("{$date} 23:59:59");
      $qb->andWhere('l.aangemaakt_op BETWEEN :start AND :end')
        ->setParameter('start', $start)
        ->setParameter('end', $end);
    }
    // by date range
    if ($from = $request->query->get('from')) {
      $qb->andWhere('l.aangemaakt_op >= :from')
        ->setParameter('from', new \DateTime($from));
    }
    if ($to = $request->query->get('to')) {
      $qb->andWhere('l.aangemaakt_op <= :to')
        ->setParameter('to', new \DateTime($to));
    }

    // by gmn id.
    if ($gmnId = $request->query->get('gmn_id')) {
      $qb->andWhere('gm.id = :gmnId')
        ->setParameter('gmnId', $gmnId, 'uuid');
    }

    $logs = $qb->getQuery()->getResult();

    $data = array_map(fn(GebruikerMedicijnGebruik $log) => [
      'id' => $log->getId(),
      'gmn_id' => $log->getGebruikerMedicijn()->getId(),
      'medicijn_naam' => $log->getGebruikerMedicijn()->getMedicijnNaam(),
      'medicijn_turven' => $log->getMedicijnTurven(),
      'gms_id' => $log->getGebruikerMedicijnSchema()?->getId(),
      'status' => $log->getStatus(),
      'aangemaakt_op' => $log->getAangemaaktOp()->format('c'),
    ], $logs);

    return $this->json($data);
  }

  #[Route('/{id}', methods: ['DELETE'])]
  public function delete(string $id, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $currentUser */
    $currentUser = $this->getUser();
    $log = $em->getRepository(GebruikerMedicijnGebruik::class)->find($id);

    if (!$log) {
      return $this->json(['error' => 'Log niet gevonden.'], 404);
    }

    if ($log->getGebruikerMedicijn()->getGebruiker() !== $currentUser) {
      return $this->json(['error' => 'Geen rechten om dit te verwijderen.'], 403);
    }

    $em->remove($log);
    $em->flush();

    return $this->json(['message' => 'Turf verwijderd.']);
  }
}
