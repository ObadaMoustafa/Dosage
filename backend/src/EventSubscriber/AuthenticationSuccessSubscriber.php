<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use App\Entity\GebruikerAuth;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;

class AuthenticationSuccessSubscriber implements EventSubscriberInterface
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            Events::AUTHENTICATION_SUCCESS => 'onLogin',
        ];
    }

    public function onLogin(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        // confirm the user is an instance of GebruikerAuth
        if (!$user instanceof GebruikerAuth) {
            return;
        }

        // Update the last login timestamp in the db
        $user->setLaatsteLogin(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }
}