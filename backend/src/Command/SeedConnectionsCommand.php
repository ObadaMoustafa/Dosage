<?php

namespace App\Command;

use App\Entity\Gebruikers;
use App\Entity\GebruikerKoppelingen;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
  name: 'app:seed-connections',
  description: 'Seeds specific user connections (Trusted/Therapist) for patients 7, 8, 9, 10',
)]
class SeedConnectionsCommand extends Command
{
  public function __construct(
    private EntityManagerInterface $em
  ) {
    parent::__construct();
  }

  protected function execute(InputInterface $input, OutputInterface $output): int
  {
    $io = new SymfonyStyle($input, $output);

    // Define scenarios as requested
    $scenarios = [
      // Scenario 1: User 7
      7 => [
        'trusted' => [3, 8, 9, 10],
        'therapist' => [1, 2]
      ],
      // Scenario 2: User 8
      8 => [
        'trusted' => [7, 9, 10, 1],
        'therapist' => [2, 3]
      ],
      // Scenario 3: User 9
      9 => [
        'trusted' => [7, 8, 10, 2],
        'therapist' => [1, 3]
      ],
      // Scenario 4: User 10
      10 => [
        'trusted' => [7, 8, 9, 3],
        'therapist' => [1, 2]
      ]
    ];

    foreach ($scenarios as $patientNum => $relations) {
      $patientEmail = "user{$patientNum}@test.com";
      $patient = $this->getUserByEmail($patientEmail);

      if (!$patient) {
        $io->warning("Patient $patientEmail not found. Skipping.");
        continue;
      }

      $io->section("Processing Patient: $patientEmail");

      // 1. Add Trusted Connections
      foreach ($relations['trusted'] as $targetNum) {
        $this->linkUser($patient, $targetNum, 'trusted', $io);
      }

      // 2. Add Therapist Connections
      foreach ($relations['therapist'] as $targetNum) {
        $this->linkUser($patient, $targetNum, 'therapist', $io);
      }
    }

    $this->em->flush();
    $io->success('All connections seeded correctly with Access Levels!');

    return Command::SUCCESS;
  }

  private function linkUser(Gebruikers $patient, int $targetNum, string $typeKey, SymfonyStyle $io): void
  {
    $targetEmail = "user{$targetNum}@test.com";
    $targetUser = $this->getUserByEmail($targetEmail);

    if (!$targetUser) {
      $io->error("Target user $targetEmail not found.");
      return;
    }

    $repo = $this->em->getRepository(GebruikerKoppelingen::class);
    $exists = $repo->findOneBy([
      'gebruiker' => $patient,
      'gekoppelde_gebruiker' => $targetUser
    ]);

    if (!$exists) {
      $connection = new GebruikerKoppelingen();
      $connection->setGebruiker($patient);
      $connection->setGekoppeldeGebruiker($targetUser);


      // Set Type and Access Level based on the scenario key
      if ($typeKey === 'therapist') {
        $connection->setConnectionType(GebruikerKoppelingen::TYPE_THERAPIST);
        // Therapists get FULL_ACCESS
        $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_WRITE);
      } else {
        $connection->setConnectionType(GebruikerKoppelingen::TYPE_TRUSTED);
        // Trusted get READ_ONLY
        $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_READ);
      }

      $this->em->persist($connection);
      $io->text(" - Linked to $targetEmail as " . strtoupper($typeKey));
    } else {
      $io->text(" - Already linked to $targetEmail");
    }
  }

  private function getUserByEmail(string $email): ?Gebruikers
  {
    return $this->em->getRepository(Gebruikers::class)->findOneBy(['email' => $email]);
  }
}