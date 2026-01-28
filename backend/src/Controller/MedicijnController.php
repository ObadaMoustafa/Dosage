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
        'aangemaakt_op' => $medicine->getAangemaaktOp()?->$medicine->getAangemaaktOp()->format('Y-m-d H:i:s'),
      ];
    }

    return $this->json($data);
  }

}