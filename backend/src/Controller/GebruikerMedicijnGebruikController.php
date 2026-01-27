<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerKoppelingen;
use App\Entity\GebruikerMedicijn;
use App\Entity\GebruikerMedicijnGebruik;
use App\Entity\GebruikerMedicijnSchema;
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

    // 1. Validate gmn_id
    $gmnId = $data['gmn_id'] ?? null;
    if (!$gmnId)
      return $this->json(['error' => 'gmn_id is verplicht.'], 400);

    // Separate Checks
    $gebruikerMedicijn = $em->getRepository(GebruikerMedicijn::class)->find($gmnId);
    if (!$gebruikerMedicijn)
      return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
    if ($gebruikerMedicijn->getGebruiker() !== $currentUser)
      return $this->json(['error' => 'Geen rechten.'], 403);

    // Validate Status
    $rawStatus = $data['status'] ?? 'optijd';
    $status = strtolower(trim($rawStatus));

    if (!in_array($status, ['optijd', 'gemist'])) {
      return $this->json([
        'error' => "Status '$rawStatus' is ongeldig. Gebruik: optijd, gemist"
      ], 400);
    }

    $log = new GebruikerMedicijnGebruik();
    $log->setGebruikerMedicijn($gebruikerMedicijn);
    $log->setStatus($status);

    // Handle Time
    if (!empty($data['aangemaakt_op'])) {
      try {
        $log->setAangemaaktOp(new \DateTime($data['aangemaakt_op']));
      } catch (\Exception $e) {
      }
    }

    // Default Turven (Fallback to 1)
    $amountToLog = (int) ($data['medicijn_turven'] ?? 1);

    // 2. Handle Schema Link & Update
    if (!empty($data['gms_id'])) {
      $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($data['gms_id']);

      if (!$schema)
        return $this->json(['error' => 'Schema niet gevonden.'], 404);
      if ($schema->getGebruikerMedicijn() !== $gebruikerMedicijn)
        return $this->json(['error' => 'Schema hoort niet bij dit medicijn.'], 400);

      $log->setGebruikerMedicijnSchema($schema);

      // --- FIX 1: Take amount from Schema if not explicitly provided in request ---
      if (!isset($data['medicijn_turven'])) {
        $amountToLog = $schema->getAantal();
      }

      // --- FIX 2: Smart Next Occurrence Calculation ---
      $timezone = new \DateTimeZone('Europe/Amsterdam');
      $now = new \DateTime('now', $timezone);

      // Start searching from NOW by default
      $searchStartDate = clone $now;

      // IF there is a planned next occurrence in the future (e.g. scheduled for 22:00, and now it's 20:00)
      // AND we are logging this now, it means we are consuming that slot.
      // So we must start searching strictly AFTER that slot to find the subsequent one.
      if ($schema->getNextOccurrence() && $schema->getNextOccurrence() > $now) {
        $searchStartDate = clone $schema->getNextOccurrence();
      }

      $nextDate = $this->calculateNextDose(
        $schema->getDagen(),
        $schema->getTijden(),
        $searchStartDate // Pass the dynamic start date
      );

      $schema->setNextOccurrence($nextDate);
    }

    $log->setMedicijnTurven($amountToLog);

    $em->persist($log);
    $em->flush();

    return $this->json([
      'message' => 'Log opgeslagen.',
      'id' => $log->getId(),
      'status' => $log->getStatus(),
      'medicijn_turven' => $log->getMedicijnTurven(),
      'next_occurrence' => isset($schema) ? $schema->getNextOccurrence()?->format('c') : null
    ], 201);
  }

  #[Route('', methods: ['GET'])]
  public function index(Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $currentUser */
    $currentUser = $this->getUser();

    // A. Determine Target Patient
    $targetPatientId = $request->query->get('user_id');
    $targetUser = $currentUser;

    if ($targetPatientId && $targetPatientId !== $currentUser->getId()->toRfc4122()) {
      $connection = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
        'gekoppelde_gebruiker' => $currentUser,
        'gebruiker' => $targetPatientId
      ]);

      if (!$connection) {
        return $this->json(['error' => 'Geen toegang tot gegevens van deze patiënt.'], 403);
      }

      $targetUser = $connection->getGebruiker();
    }

    // B. Build Query
    $qb = $em->createQueryBuilder();
    $qb->select('l', 'gm', 's')
      ->from(GebruikerMedicijnGebruik::class, 'l')
      ->join('l.gebruikerMedicijn', 'gm')
      ->leftJoin('l.gebruikerMedicijnSchema', 's')
      ->where('gm.gebruiker = :userId')
      ->setParameter('userId', $targetUser->getId(), 'uuid')
      ->orderBy('l.aangemaakt_op', 'DESC');

    // C. Filters
    if ($date = $request->query->get('date')) {
      $start = new \DateTime("{$date} 00:00:00");
      $end = new \DateTime("{$date} 23:59:59");
      $qb->andWhere('l.aangemaakt_op BETWEEN :start AND :end')
        ->setParameter('start', $start)
        ->setParameter('end', $end);
    }
    if ($from = $request->query->get('from')) {
      $qb->andWhere('l.aangemaakt_op >= :from')
        ->setParameter('from', new \DateTime($from));
    }
    if ($to = $request->query->get('to')) {
      $qb->andWhere('l.aangemaakt_op <= :to')
        ->setParameter('to', new \DateTime($to));
    }
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

    // 1. Capture Schema BEFORE deleting the log
    $schema = $log->getGebruikerMedicijnSchema();

    // 2. Remove the log
    $em->remove($log);
    $em->flush();

    // 3. Recalculate Next Occurrence if linked to a schema
    if ($schema) {
      // We calculate from NOW. 
      // Why? If I deleted a "Future Taken" log, this will find that future slot again.
      // If I deleted a "Past Taken" log, it will just find the next upcoming slot (past is past).
      $nextDate = $this->calculateNextDose($schema->getDagen(), $schema->getTijden());

      $schema->setNextOccurrence($nextDate);
      $em->flush();
    }

    return $this->json([
      'message' => 'Turf verwijderd en schema bijgewerkt.',
      'new_next_occurrence' => $schema?->getNextOccurrence()?->format('c')
    ]);
  }

  /**
   * Helper with optional startDate parameter
   */
  private function calculateNextDose(array $daysConfig, array $timesConfig, ?\DateTimeInterface $startDate = null): ?\DateTimeInterface
  {
    $timezone = new \DateTimeZone('Europe/Amsterdam');

    // Use provided startDate or default to NOW
    if ($startDate) {
      $searchDate = clone $startDate;
    } else {
      $searchDate = new \DateTime('now', $timezone);
    }

    // We want to find a slot STRICTLY greater than the searchDate
    $comparisonBase = clone $searchDate;

    $dayMap = ['zondag' => 0, 'maandag' => 1, 'dinsdag' => 2, 'woensdag' => 3, 'donderdag' => 4, 'vrijdag' => 5, 'zaterdag' => 6];
    sort($timesConfig);

    for ($i = 0; $i < 14; $i++) {
      $w = $searchDate->format('w');
      $currentDayName = array_search($w, $dayMap);

      if ($currentDayName && ($daysConfig[$currentDayName] ?? false) === true) {
        foreach ($timesConfig as $timeStr) {
          $slot = clone $searchDate;
          [$hour, $minute] = explode(':', $timeStr);
          $slot->setTime((int) $hour, (int) $minute);

          // Must be strictly in the future relative to the base comparison date
          if ($slot > $comparisonBase) {
            return $slot;
          }
        }
      }
      $searchDate->modify('+1 day');
      $searchDate->setTime(0, 0);
    }
    return null;
  }
}