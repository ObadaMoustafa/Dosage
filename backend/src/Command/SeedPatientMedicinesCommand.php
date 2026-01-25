<?php

namespace App\Command;

use App\Entity\Gebruikers;
use App\Entity\Medicijnen;
use App\Entity\GebruikerMedicijn;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
  name: 'app:seed-patient-medicines',
  description: 'Seeds 5 random medicines for patients 7, 8, 9, 10 (Copying data)',
)]
class SeedPatientMedicinesCommand extends Command
{
  public function __construct(
    private EntityManagerInterface $em
  ) {
    parent::__construct();
  }

  protected function execute(InputInterface $input, OutputInterface $output): int
  {
    $io = new SymfonyStyle($input, $output);

    // 1. Define Target Patients
    $targetIds = [7, 8, 9, 10];

    // 2. Fetch All Real Medicines
    $allMedicines = $this->em->getRepository(Medicijnen::class)->findAll();

    if (count($allMedicines) < 5) {
      $io->error('Not enough medicines in DB. Please add at least 5 medicines to the "medicijnen" table first.');
      return Command::FAILURE;
    }

    foreach ($targetIds as $id) {
      $email = "user{$id}@test.com";
      $patient = $this->em->getRepository(Gebruikers::class)->findOneBy(['email' => $email]);

      if (!$patient) {
        $io->warning("Patient $email not found. Skipping.");
        continue;
      }

      $io->section("Processing Medicines for: $email");

      // 3. Pick 5 Random Medicines
      $shuffledMeds = $allMedicines;
      shuffle($shuffledMeds);
      $selectedMeds = array_slice($shuffledMeds, 0, 5);

      foreach ($selectedMeds as $medicijn) {
        // Check duplication by Name (since there is no relation ID)
        $exists = $this->em->getRepository(GebruikerMedicijn::class)->findOneBy([
          'gebruiker' => $patient,
          'medicijn_naam' => $medicijn->getNaam()
        ]);

        if (!$exists) {
          $userMed = new GebruikerMedicijn();
          $userMed->setGebruiker($patient);

          // Copy Data (Snapshot Pattern)
          $userMed->setMedicijnNaam($medicijn->getNaam());

          // Copy optional fields if they exist in source
          if ($medicijn->getToedieningsvorm()) {
            $userMed->setToedieningsvorm($medicijn->getToedieningsvorm());
          }

          if ($medicijn->getSterkte()) {
            $userMed->setSterkte($medicijn->getSterkte());
          }

          if ($medicijn->getBeschrijving()) {
            $userMed->setBeschrijving($medicijn->getBeschrijving());
          }

          if ($medicijn->getBijsluiter()) {
            $userMed->setBijsluiter($medicijn->getBijsluiter());
          }

          $this->em->persist($userMed);
          $io->text("- Added: " . $medicijn->getNaam());
        } else {
          $io->text("- Already has: " . $medicijn->getNaam());
        }
      }
    }

    $this->em->flush();
    $io->success('Medicines seeded successfully for patients 7, 8, 9, 10!');

    return Command::SUCCESS;
  }
}