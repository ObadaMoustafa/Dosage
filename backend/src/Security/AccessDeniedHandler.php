<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

class AccessDeniedHandler implements AccessDeniedHandlerInterface
{
  public function handle(Request $request, AccessDeniedException $accessDeniedException): ?JsonResponse
  {
    return new JsonResponse([
      'error' => 'Access Denied.',
      'message' => $accessDeniedException->getMessage(), // "The user doesn't have ROLE_PATIENT"
      'code' => 403
    ], 403);
  }
}