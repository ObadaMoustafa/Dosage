<?php

namespace App\Controller;

use App\Repository\MedicijnenRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/medicines')]
class MedicijnController extends AbstractController
{
  #[Route('/search', methods: ['GET'])]
  public function search(Request $request, MedicijnenRepository $medicijnenRepository): JsonResponse
  {
    $query = $request->query->get('q');

    // Validation: If query is empty or too short
    if (!$query || strlen(trim($query)) < 1) {
      return $this->json([]);
    }

    $medicines = $medicijnenRepository->findByNamePart($query);

    $data = [];
    foreach ($medicines as $medicine) {
      $data[] = [
        'id' => $medicine->getId(),
        'naam' => $medicine->getNaam(),
        // Add brand or dosage if available in your entity
        // 'brand' => $medicine->getMerk(), 
      ];
    }

    return $this->json($data);
  }
}