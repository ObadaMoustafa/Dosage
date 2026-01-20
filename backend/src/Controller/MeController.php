<?php

namespace App\Controller;

use App\Entity\GebruikerAuth;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MeController extends AbstractController
{
    #[Route('/api/auth/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var GebruikerAuth|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'User not found or not logged in'], 401);
        }

        $profile = $user->getGebruiker();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'first_name' => $profile ?->getVoornaam(),
            'last_name' => $profile ?->getAchternaam(),
            'role' => $profile ?->getRol(),
            'profile_id' => $profile ?->getId(),
            'created_at' => $profile ?->getAangemaaktOp()->format('Y-m-d H:i:s'),
        ]);
    }
}