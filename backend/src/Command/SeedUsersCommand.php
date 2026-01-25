<?php

namespace App\Command;

use App\Entity\Gebruikers;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Factory;

#[AsCommand(
  name: 'app:seed-users',
  description: 'Seeds 10 users with specific roles (admin, behandelaar, patient) and fake Dutch names',
)]
class SeedUsersCommand extends Command
{
  public function __construct(
    private EntityManagerInterface $entityManager,
    private UserPasswordHasherInterface $passwordHasher
  ) {
    parent::__construct();
  }

  protected function execute(InputInterface $input, OutputInterface $output): int
  {
    $io = new SymfonyStyle($input, $output);

    // 1. Initialize Faker (Dutch Locale)
    $faker = Factory::create('nl_NL');

    $password = ';lkj;lkj';
    $createdCount = 0;

    for ($i = 1; $i <= 10; $i++) {
      $email = "user{$i}@test.com";

      // Check if user exists
      if ($this->entityManager->getRepository(Gebruikers::class)->findOneBy(['email' => $email])) {
        continue; // Skip if exists
      }

      $user = new Gebruikers();
      $user->setEmail($email);

      // 2. Set Fake Names
      $user->setVoornaam($faker->firstName());
      $user->setAchternaam($faker->lastName());

      // 3. Hash Password
      $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
      $user->setPassword($hashedPassword);

      // 4. Set Role using setRol() as defined in your Entity
      if ($i <= 3) {
        // Users 1, 2, 3 -> Behandelaar
        $user->setRol('behandelaar');
      } elseif ($i <= 6) {
        // Users 4, 5, 6 -> Admin
        $user->setRol('admin');
      } else {
        // Users 7, 8, 9, 10 -> Patient
        $user->setRol('patient');
      }

      $this->entityManager->persist($user);
      $createdCount++;
    }

    $this->entityManager->flush();

    if ($createdCount > 0) {
      $io->success("$createdCount users seeded successfully with fake names!");
    } else {
      $io->warning("No new users were created (they might already exist).");
    }

    return Command::SUCCESS;
  }
}