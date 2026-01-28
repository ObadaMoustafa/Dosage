<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\VoorraadItem;
use App\Repository\VoorraadItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/stock')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class VoorraadController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(VoorraadItemRepository $repo): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();

        $items = $repo->findBy(['gebruiker' => $user], ['last_updated' => 'DESC']);

        $data = array_map(fn(VoorraadItem $item) => [
            'id' => $item->getId(),
            'name' => $item->getName(),
            'packs_count' => $item->getStripsCount(),
            'pills_per_pack' => $item->getPillsPerStrip(),
            'strips_count' => $item->getStripsCount(),
            'pills_per_strip' => $item->getPillsPerStrip(),
            'loose_pills' => $item->getLoosePills(),
            'threshold' => $item->getThreshold(),
            'status' => $item->getStatus(),
            'last_updated' => $item->getLastUpdated()?->format('c'),
        ], $items);

        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $name = trim($data['name'] ?? '');
        if ($name === '') {
            return $this->json(['error' => 'Naam is verplicht.'], 400);
        }

        $item = new VoorraadItem();
        $item->setGebruiker($user);
        $item->setName($name);
        $packsCount = $data['packs_count'] ?? $data['strips_count'] ?? 0;
        $pillsPerPack = $data['pills_per_pack'] ?? $data['pills_per_strip'] ?? 0;
        $item->setStripsCount((int) $packsCount);
        $item->setPillsPerStrip((int) $pillsPerPack);
        $item->setLoosePills((int) ($data['loose_pills'] ?? 0));
        $item->setThreshold((int) ($data['threshold'] ?? 0));

        $status = $data['status'] ?? VoorraadItem::STATUS_OP_PEIL;
        if (!in_array($status, [VoorraadItem::STATUS_OP_PEIL, VoorraadItem::STATUS_BIJNA_OP, VoorraadItem::STATUS_BIJNA_LEEG], true)) {
            return $this->json(['error' => 'Ongeldige status.'], 400);
        }
        $item->setStatus($status);
        $item->setLastUpdated(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $em->persist($item);
        $em->flush();

        return $this->json(['id' => $item->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        /** @var VoorraadItem|null $item */
        $item = $em->getRepository(VoorraadItem::class)->find($id);
        if (!$item) {
            return $this->json(['error' => 'Voorraad item niet gevonden.'], 404);
        }
        if ($item->getGebruiker() !== $user) {
            return $this->json(['error' => 'Geen rechten om dit item te bewerken.'], 403);
        }

        if (isset($data['name'])) {
            $item->setName(trim($data['name']));
        }
        if (array_key_exists('packs_count', $data) || array_key_exists('strips_count', $data)) {
            $packsCount = $data['packs_count'] ?? $data['strips_count'] ?? $item->getStripsCount();
            $item->setStripsCount((int) $packsCount);
        }
        if (array_key_exists('pills_per_pack', $data) || array_key_exists('pills_per_strip', $data)) {
            $pillsPerPack = $data['pills_per_pack'] ?? $data['pills_per_strip'] ?? $item->getPillsPerStrip();
            $item->setPillsPerStrip((int) $pillsPerPack);
        }
        if (array_key_exists('loose_pills', $data)) {
            $item->setLoosePills((int) $data['loose_pills']);
        }
        if (array_key_exists('threshold', $data)) {
            $item->setThreshold((int) $data['threshold']);
        }
        if (array_key_exists('status', $data)) {
            $status = $data['status'];
            if (!in_array($status, [VoorraadItem::STATUS_OP_PEIL, VoorraadItem::STATUS_BIJNA_OP, VoorraadItem::STATUS_BIJNA_LEEG], true)) {
                return $this->json(['error' => 'Ongeldige status.'], 400);
            }
            $item->setStatus($status);
        }

        $item->setLastUpdated(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $em->flush();

        return $this->json(['message' => 'Voorraad bijgewerkt.']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        /** @var VoorraadItem|null $item */
        $item = $em->getRepository(VoorraadItem::class)->find($id);
        if (!$item) {
            return $this->json(['error' => 'Voorraad item niet gevonden.'], 404);
        }
        if ($item->getGebruiker() !== $user) {
            return $this->json(['error' => 'Geen rechten om dit item te verwijderen.'], 403);
        }

        $em->remove($item);
        $em->flush();

        return $this->json(['message' => 'Voorraad item verwijderd.']);
    }
}
