<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerMedicijn;
use App\Entity\GebruikerKoppelingen;
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
    public function index(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // Check if the requester wants to see another user's medicines (e.g. Therapist viewing Patient)
        $targetUserId = $request->query->get('user_id');

        if ($targetUserId) {
            $targetUser = $em->getRepository(Gebruikers::class)->find($targetUserId);

            if (!$targetUser) {
                return $this->json(['error' => 'User not found.'], 404);
            }

            // SECURITY CHECK: Verify connection exists
            // "Is there a link where Target is the Patient AND CurrentUser is the Connected User?"
            $isLinked = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
                'gebruiker' => $targetUser,          // Patient
                'gekoppelde_gebruiker' => $currentUser // Therapist/Family
            ]);

            if (!$isLinked) {
                return $this->json(['error' => 'Access denied. You are not connected to this user.'], 403);
            }

            $userToFetch = $targetUser;
        } else {
            // Default: User viewing their own medicines
            $userToFetch = $currentUser;
        }

        $medicines = $em->getRepository(GebruikerMedicijn::class)->findBy(
            ['gebruiker' => $userToFetch],
            ['aangemaakt_op' => 'DESC']
        );

        $data = array_map(fn(GebruikerMedicijn $m) => [
            'id' => $m->getId(),
            'medicijn_naam' => $m->getMedicijnNaam(),
            'toedieningsvorm' => $m->getToedieningsvorm(),
            'sterkte' => $m->getSterkte(),
            'beschrijving' => $m->getBeschrijving(),
            'bijsluiter' => $m->getBijsluiter(),
            'aangemaakt_op' => $m->getAangemaaktOp()->format('Y-m-d H:i:s'),
        ], $medicines);

        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('ROLE_PATIENT')] // Only patients can ADD medicines (for now)
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

    // id => the row id.
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('ROLE_PATIENT')] // Only patients can DELETE medicines
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

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id, EntityManagerInterface $em): JsonResponse
    {
        $med = $em->getRepository(GebruikerMedicijn::class)->find($id);

        if (!$med) {
            return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
        }

        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();
        $owner = $med->getGebruiker();

        // Authorization: Allow if Owner OR Connected Therapist/Family
        if ($owner !== $currentUser) {
            $isLinked = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
                'gebruiker' => $owner,
                'gekoppelde_gebruiker' => $currentUser
            ]);

            if (!$isLinked) {
                return $this->json(['error' => 'Geen toegang.'], 403);
            }
        }

        return $this->json([
            'id' => $med->getId(),
            'medicijn_naam' => $med->getMedicijnNaam(),
            'toedieningsvorm' => $med->getToedieningsvorm(),
            'sterkte' => $med->getSterkte(),
            'beschrijving' => $med->getBeschrijving(),
            'bijsluiter' => $med->getBijsluiter(),
            'aangemaaket_op' => $med->getAangemaaktOp()->format('Y-m-d H:i:s'),
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
        // We compare the User Object or User ID
        if ($med->getGebruiker() !== $currentUser) {
            return $this->json(['error' => 'Geen rechten om dit medicijn te bewerken.'], 403);
        }

        // --- At this point, everything is valid ---

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
}