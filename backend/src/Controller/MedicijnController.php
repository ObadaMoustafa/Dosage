<?php

namespace App\Controller;

use App\Entity\Medicijnen;
use App\Repository\MedicijnenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/medicines')]
class MedicijnController extends AbstractController
{
  #[Route('/search', methods: ['GET'])]
  public function search(Request $request, MedicijnenRepository $medicijnenRepository): JsonResponse
  {
    $query = $request->query->get('q');

    // Validation
    if (!$query || strlen(trim($query)) < 1) {
      return $this->json([]);
    }

    $medicines = $medicijnenRepository->findByNamePart($query);

    $data = [];
    foreach ($medicines as $medicine) {
      $data[] = [
        'id' => $medicine->getId(),
        'naam' => $medicine->getNaam(),
        'toedieningsvorm' => $medicine->getToedieningsvorm(),
        'sterkte' => $medicine->getSterkte(),
        'beschrijving' => $medicine->getBeschrijving(),
        'bijsluiter' => $medicine->getBijsluiter(),
        // Formatting date is safer for JSON response
        'aangemaakt_op' => $medicine->getAangemaaktOp() ? $medicine->getAangemaaktOp()->format('Y-m-d H:i:s') : null,
      ];
    }

    return $this->json($data);
  }

  #[Route('', methods: ['GET'])]
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

  #[Route('/add', methods: ['POST'])]
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
}