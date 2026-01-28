<?php

namespace App\Security;

use App\Entity\Gebruikers;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
  public function checkPreAuth(UserInterface $user): void
  {
    if (!$user instanceof Gebruikers) {
      return;
    }

    if (!$user->getIsActive()) {
      throw new CustomUserMessageAccountStatusException(
        'Your account is deactivated please contact our customer service.'
      );
    }
  }

  public function checkPostAuth(UserInterface $user, ?TokenInterface $token = null): void
  {
    if (!$user instanceof Gebruikers) {
      return;
    }

    if (!$user->getIsActive()) {
      throw new CustomUserMessageAccountStatusException(
        'Your account is deactivated please contact our customer service.'
      );
    }
  }
}