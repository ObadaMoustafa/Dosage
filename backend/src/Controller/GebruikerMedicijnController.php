<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerMedicijn;
use App\Entity\VoorraadItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/medicines/me')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class GebruikerMedicijnController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function getAll(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();
        $targetUser = $currentUser;

        // 1. Check if requesting another user's data
        $targetUserId = $request->query->get('user_id');

        if ($targetUserId && $targetUserId !== $currentUser->getId()->toRfc4122()) {
            // Search for ANY connection (existence means valid)
            $connection = $em->getRepository(\App\Entity\GebruikerKoppelingen::class)->findOneBy([
                'gekoppelde_gebruiker' => $currentUser,
                'gebruiker' => $targetUserId
            ]);

            if (!$connection) {
                return $this->json(['error' => 'Geen toegang tot de medicijnen van deze gebruiker.'], 403);
            }

            $targetUser = $connection->getGebruiker();
        }

        // 2. Fetch medicines for the Target User
        $medicines = $em->getRepository(GebruikerMedicijn::class)->findBy(
            ['gebruiker' => $targetUser],
            ['aangemaakt_op' => 'DESC']
        );

        $data = array_map(fn(GebruikerMedicijn $m) => [
            'id' => $m->getId(),
            'medicijn_naam' => $m->getMedicijnNaam(),
            'toedieningsvorm' => $m->getToedieningsvorm(),
            'sterkte' => $m->getSterkte(),
            'beschrijving' => $m->getBeschrijving(),
            'bijsluiter' => $m->getBijsluiter(),
            'stock_id' => $m->getVoorraadItem()?->getId(),
            'added_at' => $m->getAangemaaktOp()->format('Y-m-d H:i:s'),
            'is_owner' => ($targetUser === $currentUser)
        ], $medicines);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function getOne(string $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // 1. Find Medicine
        $med = $em->getRepository(GebruikerMedicijn::class)->find($id);

        if (!$med) {
            return $this->json(['error' => 'Medicijn niet gevonden.'], 404);
        }

        // 2. Security Check: Is it mine? OR Am I connected to the owner?
        $owner = $med->getGebruiker();

        if ($owner !== $currentUser) {
            // Check existence of connection only
            $connection = $em->getRepository(\App\Entity\GebruikerKoppelingen::class)->findOneBy([
                'gekoppelde_gebruiker' => $currentUser,
                'gebruiker' => $owner
            ]);

            if (!$connection) {
                return $this->json(['error' => 'Geen toegang tot dit medicijn.'], 403);
            }
        }

        return $this->json([
            'id' => $med->getId(),
            'medicijn_naam' => $med->getMedicijnNaam(),
            'toedieningsvorm' => $med->getToedieningsvorm(),
            'sterkte' => $med->getSterkte(),
            'beschrijving' => $med->getBeschrijving(),
            'bijsluiter' => $med->getBijsluiter(),
            'stock_id' => $med->getVoorraadItem()?->getId(),
            'added_at' => $med->getAangemaaktOp()->format('Y-m-d H:i:s'),
            'owner_id' => $owner->getId()
        ]);
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('ROLE_PATIENT')]
    public function add(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        $payload = json_decode($request->getContent(), true);

        // 1. trim inputs
        $inputName = trim($payload['medicijn_naam'] ?? '');
        $inputStrength = trim($payload['sterkte'] ?? '');

        // 2. Check empty fields
        if ($inputName === '' || $inputStrength === '') {
            return $this->json([
                'error' => 'Medicijn naam en sterkte zijn verplicht.'
            ], 400);
        }

        // get the medicines list of user.
        $existingMedicines = $em->getRepository(GebruikerMedicijn::class)->findBy([
            'gebruiker' => $user
        ]);

        foreach ($existingMedicines as $med) {
            // checking if the medicine is duplicated
            $dbName = strtolower(trim($med->getMedicijnNaam()));
            $dbStrength = strtolower(trim($med->getSterkte() ?? ''));

            if ($dbName === strtolower($inputName) && $dbStrength === strtolower($inputStrength)) {
                return $this->json([
                    'error' => 'Je hebt dit medicijn met deze sterkte al toegevoegd.'
                ], 409);
            }
        }

        // 4. Continue if it's a new medicine to user.
        $med = new GebruikerMedicijn();
        $med->setGebruiker($user);
        $med->setMedicijnNaam($inputName);
        $med->setSterkte($inputStrength);

        $med->setToedieningsvorm($payload['toedieningsvorm'] ?? null);
        $med->setBeschrijving($payload['beschrijving'] ?? null);
        $med->setBijsluiter($payload['bijsluiter'] ?? null);

        if (array_key_exists('stock_id', $payload)) {
            $stockId = $payload['stock_id'];
            if ($stockId) {
                /** @var VoorraadItem|null $stockItem */
                $stockItem = $em->getRepository(VoorraadItem::class)->find($stockId);
                if (!$stockItem || $stockItem->getGebruiker() !== $user) {
                    return $this->json(['error' => 'Ongeldige voorraad koppeling.'], 400);
                }
                $med->setVoorraadItem($stockItem);
            } else {
                $med->setVoorraadItem(null);
            }
        }

        $em->persist($med);
        $em->flush();

        return $this->json([
            'message' => 'Medicijn succesvol toegevoegd.',
            'id' => $med->getId()
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
        if (array_key_exists('stock_id', $data)) {
            $stockId = $data['stock_id'];
            if ($stockId) {
                /** @var VoorraadItem|null $stockItem */
                $stockItem = $em->getRepository(VoorraadItem::class)->find($stockId);
                if (!$stockItem || $stockItem->getGebruiker() !== $currentUser) {
                    return $this->json(['error' => 'Ongeldige voorraad koppeling.'], 400);
                }
                $med->setVoorraadItem($stockItem);
            } else {
                $med->setVoorraadItem(null);
            }
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
