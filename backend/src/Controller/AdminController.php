<?php

namespace App\Controller;
use App\Entity\Gebruikers;
use App\Entity\GebruikerKoppelingen;
use App\Entity\Medicijnen;
use App\Repository\MedicijnenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
  //^ USERS ^\\
  // Get All Users
  #[Route('/users', methods: ['GET'])]
  public function getAllUsers(EntityManagerInterface $em): JsonResponse
  {
    $users = $em->getRepository(Gebruikers::class)->findBy([], ['aangemaakt_op' => 'DESC']);

    $data = array_map(fn(Gebruikers $user) => [
      'id' => $user->getId(),
      'email' => $user->getEmail(),
      'name' => $user->getVoornaam() . ' ' . $user->getAchternaam(),
      'role' => $user->getRol(),
      'is_active' => $user->getIsActive(),
      'created_at' => $user->getAangemaaktOp()->format('Y-m-d H:i'),
    ], $users);

    return $this->json($data);
  }

  // Toggle Role (Patient <-> Behandelaar)
  #[Route('/users/role/{id}', methods: ['PUT'])]
  public function changeRole(string $id, Request $request, EntityManagerInterface $em): JsonResponse
  {
    $user = $em->getRepository(Gebruikers::class)->find($id);
    if (!$user)
      return $this->json(['error' => 'User not found'], 404);

    $data = json_decode($request->getContent(), true);
    $newRole = $data['role'] ?? null; // 'admin', 'behandelaar', 'patient'

    if (!in_array($newRole, ['admin', 'behandelaar', 'patient'])) {
      return $this->json(['error' => 'Invalid role should be one of [admin, behandelaar, patient]'], 400);
    }

    $user->setRol($newRole);
    $em->flush();

    return $this->json(['message' => "Role updated to $newRole"]);
  }

  // Reset Password (Force Reset)
  #[Route('/users/reset-password/{id}', methods: ['POST'])]
  public function resetPassword(string $id, Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em): JsonResponse
  {
    $user = $em->getRepository(Gebruikers::class)->find($id);
    if (!$user)
      return $this->json(['error' => 'User not found'], 404);

    $data = json_decode($request->getContent(), true);
    $newPass = $data['password'] ?? null;

    if (!$newPass || strlen($newPass) < 6) {
      return $this->json(['error' => 'Password must be at least 6 chars'], 400);
    }

    $user->setPassword($hasher->hashPassword($user, $newPass));
    $em->flush();

    return $this->json(['message' => 'Password reset successful']);
  }

  // Block / unblock users
  #[Route('/users/toggle-status/{id}', methods: ['POST'])]
  public function toggleUserStatus(string $id, Request $request, EntityManagerInterface $em): JsonResponse
  {
    $user = $em->getRepository(Gebruikers::class)->find($id);

    if (!$user) {
      return $this->json(['error' => 'User not found'], 404);
    }

    $data = json_decode($request->getContent(), true);

    // Validate input
    if (!isset($data['isActive']) || !is_bool($data['isActive'])) {
      return $this->json(['error' => 'Field "isActive" (boolean) is required.'], 400);
    }

    $user->setIsActive($data['isActive']);
    $em->flush();

    $statusText = $data['isActive'] ? 'activated' : 'deactivated';

    return $this->json([
      'message' => "User account has been $statusText.",
      'is_active' => $user->getIsActive()
    ]);
  }

  // ^ CONNECTIONS ^ \\
  // Manual Pairing (Force Connect Patient & Doctor/Carer)
  #[Route('/pair', methods: ['POST'])]
  public function manualPairUsers(Request $request, EntityManagerInterface $em): JsonResponse
  {
    $data = json_decode($request->getContent(), true);

    $patientId = $data['patient_id'] ?? null;
    $otherUserId = $data['other_user_id'] ?? null;
    $type = $data['type'];

    // Validate Input
    if (!$patientId) {
      return $this->json(['error' => 'Missing patient_id in the request body'], 400);
    }
    if (!$otherUserId) {
      return $this->json(['error' => 'Missing other_user_id in the request body'], 400);
    }
    if (!$type) {
      return $this->json(['error' => 'Missing type in the request body'], 400);
    }

    // Validate Type
    $allowedTypes = ['therapist', 'trusted'];
    if (!in_array($type, $allowedTypes)) {
      return $this->json(['error' => 'Invalid type. Use: therapist or trusted'], 400);
    }

    // Fetch Users
    $patient = $em->getRepository(Gebruikers::class)->find($patientId);
    $otherUser = $em->getRepository(Gebruikers::class)->find($otherUserId);

    if (!$patient || !$otherUser) {
      return $this->json(['error' => 'One user or more not found'], 404);
    }

    // control that other user should be behandelaar if the type is "therapist"
    if ($type === 'therapist' && $otherUser->getRol() !== 'behandelaar') {
      return $this->json(['error' => 'The target user is not a doctor (behandelaar).'], 400);
    }

    // Check Duplicate
    $exists = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
      'gebruiker' => $patient,
      'gekoppelde_gebruiker' => $otherUser
    ]);

    if ($exists) {
      return $this->json(['message' => 'Users are Already connected'], 409);
    }

    // 5. Create Connection & Set Details
    $link = new GebruikerKoppelingen();
    $link->setGebruiker($patient);
    $link->setGekoppeldeGebruiker($otherUser);
    $link->setConnectionType($type);

    if ($type === 'therapist') {
      $link->setAccessLevel(GebruikerKoppelingen::ACCESS_WRITE); // Doctors can edit/add
    } else {
      $link->setAccessLevel(GebruikerKoppelingen::ACCESS_READ);  // Family can only view
    }
    // --------------------------------

    $em->persist($link);
    $em->flush();

    return $this->json([
      'message' => 'Pairing successful',
      'type' => $type,
      'access_level' => $link->getAccessLevel()
    ]);
  }

  // Manual Unpair (Remove Connection)
  #[Route('/unpair', methods: ['POST'])]
  public function manualUnPair(Request $request, EntityManagerInterface $em): JsonResponse
  {
    $data = json_decode($request->getContent(), true);
    $patientId = $data['patient_id'] ?? null;
    $otherUserId = $data['other_user_id'] ?? null; // Renamed

    if (!$patientId || !$otherUserId) {
      return $this->json(['error' => 'Missing one or more IDs (patient_id, other_user_id) in the request body'], 400);
    }

    $patient = $em->getRepository(Gebruikers::class)->find($patientId);
    $otherUser = $em->getRepository(Gebruikers::class)->find($otherUserId);

    if (!$patient || !$otherUser) {
      return $this->json(['error' => 'One or more user not found'], 404);
    }

    // Search for the connection
    $repo = $em->getRepository(GebruikerKoppelingen::class);
    $connection = $repo->findOneBy([
      'gebruiker' => $patient,
      'gekoppelde_gebruiker' => $otherUser
    ]);

    if (!$connection) {
      return $this->json(['error' => 'These users are not connected already'], 404);
    }

    $em->remove($connection);
    $em->flush();

    return $this->json(['message' => 'Un-paired successfully. Connection removed.']);
  }

  // ^ MEDICINES ^ \\
  #[Route('/medicines', methods: ['GET'])]
  #[IsGranted('ROLE_ADMIN')]
  public function index(MedicijnenRepository $medicijnenRepository): JsonResponse
  {
    $medicines = $medicijnenRepository->findBy([], ['aangemaakt_op' => 'DESC']);

    $data = [];
    foreach ($medicines as $medicine) {
      $data[] = [
        'id' => $medicine->getId(),
        'naam' => $medicine->getNaam(),
        'toedieningsvorm' => $medicine->getToedieningsvorm(),
        'sterkte' => $medicine->getSterkte(),
        'beschrijving' => $medicine->getBeschrijving(),
        'bijsluiter' => $medicine->getBijsluiter(),
        'aangemaakt_op' => $medicine->getAangemaaktOp() ? $medicine->getAangemaaktOp()->format('Y-m-d H:i:s') : null,
      ];
    }

    return $this->json($data);
  }

  #[Route('/medicines', methods: ['POST'])]
  #[IsGranted('ROLE_ADMIN')]
  public function create(Request $request, EntityManagerInterface $em, MedicijnenRepository $repo): JsonResponse
  {
    $data = json_decode($request->getContent(), true);

    // 1. prepare entries.
    $naam = trim($data['naam'] ?? '');
    $toedieningsvorm = trim($data['toedieningsvorm'] ?? '');
    $sterkte = trim($data['sterkte'] ?? '');
    $beschrijving = trim($data['beschrijving'] ?? '');
    $bijsluiter = trim($data['bijsluiter'] ?? '');

    // 2. check required fields
    if (empty($naam) || empty($toedieningsvorm) || empty($sterkte) || empty($beschrijving) || empty($bijsluiter)) {
      return $this->json([
        'error' => 'All fields are required (naam, toedieningsvorm, sterkte, beschrijving, bijsluiter).'
      ], 400);
    }

    // check duplication.
    $existing = $repo->createQueryBuilder('m')
      ->where('LOWER(m.naam) = :naam')
      ->andWhere('LOWER(m.toedieningsvorm) = :vorm')
      ->andWhere('LOWER(m.sterkte) = :sterkte')
      ->setParameter('naam', strtolower($naam))
      ->setParameter('vorm', strtolower($toedieningsvorm))
      ->setParameter('sterkte', strtolower($sterkte))
      ->setMaxResults(1)
      ->getQuery()
      ->getOneOrNullResult();

    if ($existing) {
      return $this->json([
        'error' => 'This medicine with the same form and strength already exists.'
      ], 409);
    }

    // 4. save in the db
    $medicijn = new Medicijnen();
    $medicijn->setNaam($naam);
    $medicijn->setToedieningsvorm($toedieningsvorm);
    $medicijn->setSterkte($sterkte);
    $medicijn->setBeschrijving($beschrijving);
    $medicijn->setBijsluiter($bijsluiter);

    $em->persist($medicijn);
    $em->flush();

    return $this->json([
      'message' => 'Medicine created successfully.',
      'id' => $medicijn->getId()
    ], 201);
  }

  // Delete medicines
  #[Route('/medicines/{id}', methods: ['DELETE'])]
  public function deleteMedicine(string $id, EntityManagerInterface $em): JsonResponse
  {
    $medicijn = $em->getRepository(Medicijnen::class)->find($id);

    if (!$medicijn) {
      return $this->json(['error' => 'Medicine not found'], 404);
    }

    $em->remove($medicijn);
    $em->flush();

    return $this->json(['message' => 'Medicine deleted successfully.']);
  }
}