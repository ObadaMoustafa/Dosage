<?php

namespace App\Command;

use App\Entity\Gebruikers;
use App\Entity\GebruikerMedicijn;
use App\Entity\GebruikerMedicijnSchema;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Factory;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
  name: 'app:seed-schedules',
  description: 'Seeds schedules for users 7, 8, 9, 10 (based on their test emails)',
)]
class SeedSchedulesCommand extends Command
{
  public function __construct(
    private EntityManagerInterface $em
  ) {
    parent::__construct();
  }

  protected function execute(InputInterface $input, OutputInterface $output): int
  {
    $io = new SymfonyStyle($input, $output);
    $faker = Factory::create('nl_NL');

    // Target specific test users by Email
    $targetEmails = [
      'user7@test.com',
      'user8@test.com',
      'user9@test.com',
      'user10@test.com'
    ];

    $io->section('Seeding Schedules for Test Patients...');
    $count = 0;

    foreach ($targetEmails as $email) {
      // Find User by Email
      $user = $this->em->getRepository(Gebruikers::class)->findOneBy(['email' => $email]);

      if (!$user) {
        $io->warning("User with email $email not found. Did you run app:seed-users?");
        continue;
      }

      $io->text("Processing User: $email");

      // Get all medicines for this user
      $medicines = $this->em->getRepository(GebruikerMedicijn::class)->findBy([
        'gebruiker' => $user
      ]);

      if (empty($medicines)) {
        $io->note("No medicines found for $email. Run app:seed-patient-medicines first.");
        continue;
      }

      foreach ($medicines as $med) {
        // Check if schema already exists to avoid duplicates
        $exists = $this->em->getRepository(GebruikerMedicijnSchema::class)->findOneBy([
          'gebruikerMedicijn' => $med
        ]);

        if ($exists) {
          continue;
        }

        $schema = new GebruikerMedicijnSchema();
        $schema->setGebruikerMedicijn($med);

        // Random Days
        $dagen = [
          'maandag' => $faker->boolean(70),
          'dinsdag' => $faker->boolean(70),
          'woensdag' => $faker->boolean(70),
          'donderdag' => $faker->boolean(70),
          'vrijdag' => $faker->boolean(70),
          'zaterdag' => $faker->boolean(40),
          'zondag' => $faker->boolean(40),
        ];

        // Ensure at least one day is true
        if (!in_array(true, $dagen)) {
          $dagen['maandag'] = true;
        }
        $schema->setDagen($dagen);

        // Random Times
        $times = $faker->randomElements(['08:00', '12:00', '14:00', '18:00', '20:00', '22:00'], mt_rand(1, 3));
        sort($times);
        $schema->setTijden($times);

        // Random Amount & Description
        $schema->setAantal($faker->numberBetween(1, 3));
        $schema->setBeschrijving($faker->randomElement([
          'Innemen met water',
          'Voor de maaltijd',
          'Na de maaltijd',
          'Niet kauwen',
          'Voor het slapen gaan'
        ]));

        // --- Calculate Initial Next Occurrence ---
        $nextDate = $this->calculateNextDose($dagen, $times);
        $schema->setNextOccurrence($nextDate);
        // -----------------------------------------

        $this->em->persist($schema);
        $count++;
      }
    }

    $this->em->flush();

    $io->success("$count Schedules created successfully for users 7, 8, 9, 10!");

    return Command::SUCCESS;
  }

  /**
   * Helper function to find the first scheduled time STRICTLY AFTER now.
   */
  private function calculateNextDose(array $daysConfig, array $timesConfig): ?\DateTimeInterface
  {
    $timezone = new \DateTimeZone('Europe/Amsterdam');
    $now = new \DateTime('now', $timezone);
    $searchDate = clone $now;

    // Map Dutch day names to PHP numeric representation (w: 0=Sunday, 6=Saturday)
    $dayMap = [
      'zondag' => 0,
      'maandag' => 1,
      'dinsdag' => 2,
      'woensdag' => 3,
      'donderdag' => 4,
      'vrijdag' => 5,
      'zaterdag' => 6,
    ];

    // Sort times to ensure order (e.g., ["08:00", "14:00", "20:00"])
    sort($timesConfig);

    // Limit search to 14 days to prevent infinite loops
    for ($i = 0; $i < 14; $i++) {
      $w = $searchDate->format('w');
      $currentDayName = array_search($w, $dayMap);

      // Check if this day is enabled in schema
      if ($currentDayName && ($daysConfig[$currentDayName] ?? false) === true) {
        // Check times for this day
        foreach ($timesConfig as $timeStr) {
          $slot = clone $searchDate;
          [$hour, $minute] = explode(':', $timeStr);
          $slot->setTime((int) $hour, (int) $minute);

          // Must be in the future (Strictly greater than NOW)
          if ($slot > $now) {
            return $slot;
          }
        }
      }

      // Move to next day, set time to 00:00 to check all slots from start of day
      $searchDate->modify('+1 day');
      $searchDate->setTime(0, 0);
    }

    return null; // No future schedule found
  }
}