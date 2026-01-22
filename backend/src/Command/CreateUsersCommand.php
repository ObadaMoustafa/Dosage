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

#[AsCommand(
    name: 'app:create-users',
    description: 'Creates 10 standard users (Patients by default) with password ;lkj;lkj',
)]
class CreateUsersCommand extends Command
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

        $commonPassword = ';lkj;lkj';

        // Create 10 Standard Users
        for ($i = 1; $i <= 10; $i++) {
            $user = new Gebruikers();

            $user->setEmail("user{$i}@test.com");
            $user->setVoornaam("User{$i}");
            $user->setAchternaam("Test");

            // Mimic standard registration behavior (Default is patient)
            $user->setRol('patient');

            // Standard Avatar
            $fullName = "User{$i}+Test";
            $avatarUrl = "https://ui-avatars.com/api/?name={$fullName}&background=random&color=fff&size=128&bold=true&rounded=true&format=png";
            $user->setAvatarUrl($avatarUrl);

            // Hash Password
            $user->setPassword($this->passwordHasher->hashPassword($user, $commonPassword));

            $this->entityManager->persist($user);
        }

        $this->entityManager->flush();

        $io->success('10 Standard Users created successfully!');
        $io->text('All users have password: ' . $commonPassword);
        $io->text('Emails: user1@test.com to user10@test.com');

        return Command::SUCCESS;
    }
}