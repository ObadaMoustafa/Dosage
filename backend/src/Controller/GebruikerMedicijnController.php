<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerMedicijn;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/my-medicines')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class GebruikerMedicijnController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();

        // Fetch ONLY current user's medicines
        $medicines = $em->getRepository(GebruikerMedicijn::class)->findBy(
            ['gebruiker' => $user],
            ['aangemaakt_op' => 'DESC']
        );

        $data = array_map(fn(GebruikerMedicijn $m) => [
            'id' => $m->getId(),
            'medicijn_naam' => $m->getMedicijnNaam(),
            'toedieningsvorm' => $m->getToedieningsvorm(),
            'sterkte' => $m->getSterkte(),
            'beschrijving' => $m->getBeschrijving(),
            'bijsluiter' => $m->getBijsluiter(),
            'added_at' => $m->getAangemaaktOp()->format('Y-m-d H:i:s'),
        ], $medicines);

        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('ROLE_PATIENT')]
    public function add(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        $payload = json_decode($request->getContent(), true);

        $medicijnNaam = $payload['medicijn_naam'] ?? null;

        if (!$medicijnNaam) {
            return $this->json(['error' => 'Medicijn naam is verplicht.'], 400);
        }

        $med = new GebruikerMedicijn();
        $med->setGebruiker($user);
        $med->setMedicijnNaam($medicijnNaam);
        $med->setToedieningsvorm($payload['toedieningsvorm'] ?? null);
        $med->setSterkte($payload['sterkte'] ?? null);
        $med->setBeschrijving($payload['beschrijving'] ?? null);
        $med->setBijsluiter($payload['bijsluiter'] ?? null);

        $em->persist($med);
        $em->flush();

        return $this->json([
            'message' => 'Medicijn succesvol toegevoegd.',
            'id' => $med->getId()
        ]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        $med = $em->getRepository(GebruikerMedicijn::class)->findOneBy([
            'id' => $id,
            'gebruiker' => $currentUser // Force ownership check
        ]);

        if (!$med) {
            return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
        }

        return $this->json([
            'id' => $med->getId(),
            'medicijn_naam' => $med->getMedicijnNaam(),
            'toedieningsvorm' => $med->getToedieningsvorm(),
            'sterkte' => $med->getSterkte(),
            'beschrijving' => $med->getBeschrijving(),
            'bijsluiter' => $med->getBijsluiter(),
            'added_at' => $med->getAangemaaktOp()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // 1. First, find the medicine by ID ONLY
        $med = $em->getRepository(GebruikerMedicijn::class)->find($id);

        // Case A: Medicine simply doesn't exist
        if (!$med) {
            return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
        }

        // Case B: Medicine exists, but belongs to someone else
        if ($med->getGebruiker() !== $currentUser) {
            return $this->json(['error' => 'Geen rechten om dit medicijn te bewerken.'], 403);
        }

        // Update fields if present
        if (isset($data['medicijn_naam'])) {
            $med->setMedicijnNaam($data['medicijn_naam']);
        }
        if (array_key_exists('toedieningsvorm', $data)) {
            $med->setToedieningsvorm($data['toedieningsvorm']);
        }
        if (array_key_exists('sterkte', $data)) {
            $med->setSterkte($data['sterkte']);
        }
        if (array_key_exists('beschrijving', $data)) {
            $med->setBeschrijving($data['beschrijving']);
        }
        if (array_key_exists('bijsluiter', $data)) {
            $med->setBijsluiter($data['bijsluiter']);
        }

        $em->flush();

        return $this->json([
            'message' => 'Medicijn succesvol bijgewerkt.',
            'id' => $med->getId()
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('ROLE_PATIENT')]
    public function delete(string $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();

        $med = $em->getRepository(GebruikerMedicijn::class)->findOneBy([
            'id' => $id,
            'gebruiker' => $user
        ]);

        if (!$med) {
            return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
        }

        $em->remove($med);
        $em->flush();

        return $this->json(['message' => 'Medicijn verwijderd.']);
    }
}