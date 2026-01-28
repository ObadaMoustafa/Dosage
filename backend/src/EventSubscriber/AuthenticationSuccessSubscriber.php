<?php

namespace App\EventSubscriber;

use App\Entity\Gebruikers;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;

class AuthenticationSuccessSubscriber implements EventSubscriberInterface
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLogin',
        ];
    }

    public function onLogin(LoginSuccessEvent $event): void
    {
        $user = $event->getUser();

        if (!$user instanceof Gebruikers) {
            return;
        }

        $user->setLaatsteLogin(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }
}