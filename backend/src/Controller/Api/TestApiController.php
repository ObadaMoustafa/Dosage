<?php
namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class TestApiController extends AbstractController
{
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            [
                'title' => 'Sample Medicine',
                'description' => 'This is a sample medicine description.',
            ],
            [
                'title' => 'Another Medicine',
                'description' => 'Another example medicine description.',
            ],
        ]);
    }
}
