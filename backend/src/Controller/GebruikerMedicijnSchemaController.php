<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerKoppelingen;
use App\Entity\GebruikerMedicijn;
use App\Entity\GebruikerMedicijnSchema;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/schema')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class GebruikerMedicijnSchemaController extends AbstractController
{
  #[Route('', methods: ['GET'])]
  public function index(Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $currentUser */
    $currentUser = $this->getUser();

    // 1. Determine Target User (Self OR Patient)
    $targetId = $request->query->get('user_id'); // Look for user_id query param

    $targetUser = $currentUser; // Default to self

    // If a specific user_id is requested AND it's not me
    if ($targetId && $targetId !== $currentUser->getId()->toRfc4122()) {

      // Security Check: Is there a connection?
      $connection = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
        'gekoppelde_gebruiker' => $currentUser, // The viewer (Doctor/Carer)
        'gebruiker' => $targetId               // The target (Patient)
      ]);

      if (!$connection) {
        return $this->json(['error' => 'U heeft geen toegang tot de gegevens van deze gebruiker.'], 403);
      }

      // Switch context to the target user
      $targetUser = $connection->getGebruiker();
    }

    // 2. Query Schedules for the Target User
    $schedules = $em->createQueryBuilder()
      ->select('s', 'gm')
      ->from(GebruikerMedicijnSchema::class, 's')
      ->join('s.gebruikerMedicijn', 'gm')
      ->where('gm.gebruiker = :userId')
      ->setParameter('userId', $targetUser->getId(), 'uuid') // Use Target User ID
      ->orderBy('s.aangemaakt_op', 'DESC')
      ->getQuery()
      ->getResult();

    $data = array_map(fn(GebruikerMedicijnSchema $s) => [
      'id' => $s->getId(),
      'gmn_id' => $s->getGebruikerMedicijn()->getId(),
      'medicijn_naam' => $s->getGebruikerMedicijn()->getMedicijnNaam(),
      'dagen' => $s->getDagen(),
      'tijden' => $s->getTijden(),
      'next_occurrence' => $s->getNextOccurrence()?->format('c'),
      'aantal' => $s->getAantal(),
      'beschrijving' => $s->getBeschrijving(),
      'aangemaakt_op' => $s->getAangemaaktOp()->format('c'),
    ], $schedules);

    return $this->json($data);
  }

  #[Route('', methods: ['POST'])]
  public function create(Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $user */
    $user = $this->getUser();
    $payload = json_decode($request->getContent(), true);

    // 1. Validate gmn_id
    $gmnId = $payload['gmn_id'] ?? null;
    if (!$gmnId) {
      return $this->json(['error' => 'gmn_id is verplicht.'], 400);
    }

    $med = $em->getRepository(GebruikerMedicijn::class)->findOneBy([
      'id' => $gmnId,
      'gebruiker' => $user
    ]);

    if (!$med) {
      return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
    }

    // Prevent Duplicate Schemas
    $existingSchema = $em->getRepository(GebruikerMedicijnSchema::class)->findOneBy([
      'gebruikerMedicijn' => $med
    ]);

    if ($existingSchema) {
      return $this->json(['error' => 'Er bestaat al een schema voor dit medicijn.'], 409);
    }

    // 2. Validate Dagen
    $inputDagen = $payload['dagen'] ?? [];
    $requiredDays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    $cleanDagen = [];

    foreach ($requiredDays as $day) {
      if (!array_key_exists($day, $inputDagen)) {
        return $this->json(['error' => "De dag '$day' ontbreekt."], 400);
      }
      $cleanDagen[$day] = (bool) $inputDagen[$day];
    }

    // 3. Validate Tijden
    $tijden = $payload['tijden'] ?? [];
    if (!is_array($tijden) || count($tijden) === 0) {
      return $this->json(['error' => 'Minimaal één tijd is verplicht.'], 400);
    }

    // 4. Validate Aantal & Beschrijving
    $aantal = $payload['aantal'] ?? null;
    $beschrijving = trim($payload['beschrijving'] ?? '');

    if ($aantal === null || $beschrijving === '') {
      return $this->json(['error' => 'Aantal en beschrijving zijn verplicht.'], 400);
    }

    // 5. Create Schema
    $schema = new GebruikerMedicijnSchema();
    $schema->setGebruikerMedicijn($med);
    $schema->setDagen($cleanDagen);
    $schema->setTijden($tijden);
    $schema->setAantal((int) $aantal);
    $schema->setBeschrijving($beschrijving);

    // --- Calculate Initial Next Occurrence ---
    $nextDate = $this->calculateNextDose($cleanDagen, $tijden);
    $schema->setNextOccurrence($nextDate);
    // -----------------------------------------

    $em->persist($schema);
    $em->flush();

    return $this->json([
      'message' => 'Schema succesvol aangemaakt.',
      'id' => $schema->getId(),
      'next_occurrence' => $nextDate?->format('c')
    ], 201);
  }

  #[Route('/{id}', methods: ['PUT'])]
  public function update(string $id, Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $user */
    $user = $this->getUser();
    $payload = json_decode($request->getContent(), true);

    $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($id);

    if (!$schema || $schema->getGebruikerMedicijn()->getGebruiker() !== $user) {
      return $this->json(['error' => 'Niet gevonden of geen toegang.'], 404);
    }

    // Step A: Handle gmn_id Change
    $newGmnId = $payload['gmn_id'] ?? null;
    if ($newGmnId && $newGmnId !== $schema->getGebruikerMedicijn()->getId()->toRfc4122()) {
      $newMed = $em->getRepository(GebruikerMedicijn::class)->findOneBy([
        'id' => $newGmnId,
        'gebruiker' => $user
      ]);
      if (!$newMed) {
        return $this->json(['error' => 'Nieuw medicijn niet gevonden.'], 404);
      }
      // Check duplicates
      $existing = $em->getRepository(GebruikerMedicijnSchema::class)->findOneBy(['gebruikerMedicijn' => $newMed]);
      if ($existing && $existing->getId() !== $schema->getId()) {
        return $this->json(['error' => 'Dit medicijn heeft al een schema.'], 409);
      }
      $schema->setGebruikerMedicijn($newMed);
    }

    // Step B: Update Fields
    $inputDagen = $payload['dagen'] ?? null;
    if (!$inputDagen)
      return $this->json(['error' => "Dagen verplicht."], 400);

    $requiredDays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    $cleanDagen = [];
    foreach ($requiredDays as $day) {
      $cleanDagen[$day] = (bool) $inputDagen[$day];
    }

    $tijden = $payload['tijden'] ?? [];
    if (empty($tijden))
      return $this->json(['error' => 'Tijden verplicht.'], 400);

    $aantal = $payload['aantal'] ?? null;
    $beschrijving = $payload['beschrijving'] ?? null;

    $schema->setDagen($cleanDagen);
    $schema->setTijden($tijden);
    $schema->setAantal((int) $aantal);
    $schema->setBeschrijving(trim($beschrijving));

    // --- Recalculate Next Occurrence on Edit ---
    $nextDate = $this->calculateNextDose($cleanDagen, $tijden);
    $schema->setNextOccurrence($nextDate);
    // -------------------------------------------

    $em->flush();

    return $this->json([
      'message' => 'Schema bijgewerkt.',
      'next_occurrence' => $nextDate?->format('c')
    ]);
  }

  #[Route('/{id}', methods: ['DELETE'])]
  public function delete(string $id, EntityManagerInterface $em): JsonResponse
  {
    $user = $this->getUser();
    $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($id);

    if (!$schema || $schema->getGebruikerMedicijn()->getGebruiker() !== $user) {
      return $this->json(['error' => 'Geen toegang.'], 403);
    }

    $em->remove($schema);
    $em->flush();

    return $this->json(['message' => 'Schema verwijderd.']);
  }

  private function calculateNextDose(array $daysConfig, array $timesConfig): ?\DateTimeInterface
  {
    $timezone = new \DateTimeZone('Europe/Amsterdam');
    $now = new \DateTime('now', $timezone);
    $searchDate = clone $now;

    $dayMap = [
      'zondag' => 0,
      'maandag' => 1,
      'dinsdag' => 2,
      'woensdag' => 3,
      'donderdag' => 4,
      'vrijdag' => 5,
      'zaterdag' => 6,
    ];

    sort($timesConfig);

    // Search for the next 14 days
    for ($i = 0; $i < 14; $i++) {
      $w = $searchDate->format('w');
      $currentDayName = array_search($w, $dayMap); // Get Dutch name

      if ($currentDayName && ($daysConfig[$currentDayName] ?? false) === true) {
        foreach ($timesConfig as $timeStr) {
          $slot = clone $searchDate;
          [$hour, $minute] = explode(':', $timeStr);
          $slot->setTime((int) $hour, (int) $minute);

          // Must be strictly in the future
          if ($slot > $now) {
            return $slot;
          }
        }
      }

      $searchDate->modify('+1 day');
      $searchDate->setTime(0, 0); // Check from beginning of next day
    }

    return null;
  }
}