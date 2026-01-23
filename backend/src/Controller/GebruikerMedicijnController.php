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
            'added_at' => $m->getAangemaaktOp()->format('Y-m-d H:i:s'),
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
}