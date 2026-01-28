<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

class AuthenticationEntryPoint implements AuthenticationEntryPointInterface
{
  public function start(Request $request, ?AuthenticationException $authException = null): JsonResponse
  {
    $message = $authException ? $authException->getMessage() : 'Authentication Required';

    return new JsonResponse([
      'code' => 401,
      'message' => $message
    ], 401);
  }
}