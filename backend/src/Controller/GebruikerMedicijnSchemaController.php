<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerMedicijn;
use App\Entity\GebruikerMedicijnSchema;
use App\Entity\GebruikerMedicijnGebruik;
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
  public function index(EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $user */
    $user = $this->getUser();

    $schedules = $em->createQueryBuilder()
      ->select('s', 'gm')
      ->from(GebruikerMedicijnSchema::class, 's')
      ->join('s.gebruikerMedicijn', 'gm')
      ->where('gm.gebruiker = :userId')
      ->setParameter('userId', $user->getId(), 'uuid')
      ->orderBy('s.aangemaakt_op', 'DESC')
      ->getQuery()
      ->getResult();

    $data = array_map(fn(GebruikerMedicijnSchema $s) => [
      'id' => $s->getId(),
      'gmn_id' => $s->getGebruikerMedicijn()->getId(),
      'medicijn_naam' => $s->getGebruikerMedicijn()->getMedicijnNaam(),
      'dagen' => $s->getDagen(),
      'tijden' => $s->getTijden(),
      'innemen_status' => $s->getInnemenStatus(),
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

    // 1. Validate gmn_id (Required & Ownership)
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

    // --- NEW CHECK: Prevent Duplicate Schemas ---
    $existingSchema = $em->getRepository(GebruikerMedicijnSchema::class)->findOneBy([
      'gebruikerMedicijn' => $med
    ]);

    if ($existingSchema) {
      return $this->json([
        'error' => 'Er bestaat al een schema voor dit medicijn. Bewerk het bestaande schema.'
      ], 409); // 409 Conflict
    }
    // --------------------------------------------

    // 2. Validate Dagen (Strict Structure)
    $inputDagen = $payload['dagen'] ?? [];
    $requiredDays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    $cleanDagen = [];

    foreach ($requiredDays as $day) {
      if (!array_key_exists($day, $inputDagen)) {
        return $this->json(['error' => "De dag '$day' ontbreekt in het schema."], 400);
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

    $em->persist($schema);
    $em->flush();

    return $this->json([
      'message' => 'Schema succesvol aangemaakt.',
      'id' => $schema->getId()
    ], 201);
  }

  #[Route('/update_schema/{id}', methods: ['PUT'])]
  public function update(string $id, Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $user */
    $user = $this->getUser();
    $payload = json_decode($request->getContent(), true);

    // 1. Fetch Current Schema & Check Owner
    $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($id);

    if (!$schema) {
      return $this->json(['error' => 'Schema niet gevonden.'], 404);
    }

    if ($schema->getGebruikerMedicijn()->getGebruiker() !== $user) {
      return $this->json(['error' => 'Geen toegang om dit schema te bewerken.'], 403);
    }

    // =========================================================
    // Step A: Handle gmn_id Change (Strict Validation)
    // =========================================================
    $newGmnId = $payload['gmn_id'] ?? null;

    // Only proceed if gmn_id is provided AND it's different from the current one
    if ($newGmnId && $newGmnId !== $schema->getGebruikerMedicijn()->getId()->toRfc4122()) {

      // A1. Check if new medicine exists and belongs to user
      $newMed = $em->getRepository(GebruikerMedicijn::class)->findOneBy([
        'id' => $newGmnId,
        'gebruiker' => $user
      ]);

      if (!$newMed) {
        return $this->json(['error' => 'Het opgegeven medicijn (gmn_id) bestaat niet.'], 404);
      }

      // A2. Check if new medicine ALREADY has a schema (Prevent Duplicate)
      $existingSchema = $em->getRepository(GebruikerMedicijnSchema::class)->findOneBy([
        'gebruikerMedicijn' => $newMed
      ]);

      // Conflict only if schema exists AND it's not the one we are currently editing
      if ($existingSchema && $existingSchema->getId() !== $schema->getId()) {
        return $this->json([
          'error' => 'Dit medicijn heeft al een schema. U kunt geen tweede schema aanmaken.'
        ], 409); // Conflict
      }

      // A3. Apply Change
      $schema->setGebruikerMedicijn($newMed);
    }

    // =========================================================
    // Step B: Handle Standard Fields (Dagen, Tijden, Aantal...)
    // =========================================================

    // Validate Dagen
    $inputDagen = $payload['dagen'] ?? null;
    if (!$inputDagen) {
      return $this->json(['error' => "Het object 'dagen' is verplicht."], 400);
    }

    $requiredDays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    $cleanDagen = [];

    foreach ($requiredDays as $day) {
      if (!array_key_exists($day, $inputDagen)) {
        return $this->json(['error' => "De dag '$day' ontbreekt in het schema."], 400);
      }
      $cleanDagen[$day] = (bool) $inputDagen[$day];
    }

    // Validate Tijden
    $tijden = $payload['tijden'] ?? [];
    if (!is_array($tijden) || count($tijden) === 0) {
      return $this->json(['error' => 'Minimaal één tijd is verplicht.'], 400);
    }

    // Validate Aantal & Beschrijving
    $aantal = $payload['aantal'] ?? null;
    $beschrijving = $payload['beschrijving'] ?? null;

    if ($aantal === null || trim((string) $beschrijving) === '') {
      return $this->json(['error' => 'Aantal en beschrijving zijn verplicht.'], 400);
    }

    // Apply Updates
    $schema->setDagen($cleanDagen);
    $schema->setTijden($tijden);
    $schema->setAantal((int) $aantal);
    $schema->setBeschrijving(trim($beschrijving));

    $em->flush();

    return $this->json([
      'message' => 'Schema succesvol bijgewerkt.',
      'id' => $schema->getId()
    ]);
  }

  #[Route('/update_status', methods: ['PUT'])]
  public function updateStatus(Request $request, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $user */
    $user = $this->getUser();
    $payload = json_decode($request->getContent(), true);

    // 1. Get ID from Body
    $id = $payload['id'] ?? null;
    if (!$id) {
      return $this->json(['error' => 'Schema ID is verplicht.'], 400);
    }

    $status = $payload['innemen_status'] ?? null;
    if (!$status || !in_array($status, [GebruikerMedicijnSchema::STATUS_OPTIJD, GebruikerMedicijnSchema::STATUS_GEMIST])) {
      return $this->json(['error' => 'Geldige status is verplicht (optijd/gemist).'], 400);
    }

    // 2. Fetch Schema & Check Owner
    $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($id);

    if (!$schema) {
      return $this->json(['error' => 'Schema niet gevonden.'], 404);
    }

    if ($schema->getGebruikerMedicijn()->getGebruiker() !== $user) {
      return $this->json(['error' => 'Geen toegang.'], 403);
    }

    // 3. Update Status
    $schema->setInnemenStatus($status);

    // 4. AUTOMATIC LOGGING: If status is 'optijd', create a log entry
    if ($status === GebruikerMedicijnSchema::STATUS_OPTIJD) {
      $log = new GebruikerMedicijnGebruik();
      $log->setGebruikerMedicijn($schema->getGebruikerMedicijn());
      $log->setGebruikerMedicijnSchema($schema);
      $log->setMedicijnTurven($schema->getAantal()); // Use the amount from schema
      // Date is set automatically

      $em->persist($log);
    }

    $em->flush();

    return $this->json([
      'message' => 'Status bijgewerkt.',
      'id' => $schema->getId(),
      'new_status' => $status,
      'log_created' => ($status === GebruikerMedicijnSchema::STATUS_OPTIJD)
    ]);
  }

  #[Route('/{id}', methods: ['DELETE'])]
  public function delete(string $id, EntityManagerInterface $em): JsonResponse
  {
    /** @var Gebruikers $user */
    $user = $this->getUser();

    // 1. Fetch Schema
    $schema = $em->getRepository(GebruikerMedicijnSchema::class)->find($id);

    if (!$schema) {
      return $this->json(['error' => 'Schema niet gevonden.'], 404);
    }

    // 2. Check Ownership
    if ($schema->getGebruikerMedicijn()->getGebruiker() !== $user) {
      return $this->json(['error' => 'Geen toegang om dit schema te verwijderen.'], 403);
    }

    // 3. Remove
    $em->remove($schema);
    $em->flush();

    return $this->json(['message' => 'Schema succesvol verwijderd.']);
  }
}