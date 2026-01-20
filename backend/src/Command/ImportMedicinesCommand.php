<?php

namespace App\Command;

use App\Entity\Medicijnen;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AsCommand(
  name: 'app:import-medicines',
  description: 'Import medicines from OpenFDA API based on analyzed JSON structure',
)]
class ImportMedicinesCommand extends Command
{
  public function __construct(
    private HttpClientInterface $client,
    private EntityManagerInterface $entityManager
  ) {
    parent::__construct();
  }

  protected function execute(InputInterface $input, OutputInterface $output): int
  {
    $io = new SymfonyStyle($input, $output);
    $io->title('Starting import from OpenFDA...');

    $apiKey = $_SERVER['FDA_API_KEY'] ?? $_ENV['FDA_API_KEY'] ?? null;

    if (!$apiKey) {
      $io->error('FDA_API_KEY is missing in .env file.');
      return Command::FAILURE;
    }

    try {
      // We search for items that have a brand name. 
      // We prefer Prescription drugs, but the parser is robust enough for OTC too.
      $response = $this->client->request(
        'GET',
        'https://api.fda.gov/drug/label.json',
        [
          'query' => [
            'api_key' => $apiKey,
            'limit' => 50,
            'search' => 'openfda.product_type:"HUMAN PRESCRIPTION DRUG" AND _exists_:openfda.brand_name'
          ]
        ]
      );

      $data = $response->toArray();
    } catch (\Exception $e) {
      $io->error('Failed to fetch data: ' . $e->getMessage());
      return Command::FAILURE;
    }

    $count = 0;
    $io->progressStart(\count($data['results']));

    foreach ($data['results'] as $item) {
      // Ensure brand name exists
      if (empty($item['openfda']['brand_name'][0])) {
        continue;
      }

      $med = new Medicijnen();

      // 1. Naam (Brand Name)
      $brandName = $item['openfda']['brand_name'][0];
      $med->setNaam(substr($brandName, 0, 100));

      // 2. Toedieningsvorm (Dosage Form)
      // Priority: dosage_form -> route -> 'Unknown'
      $form = 'Unknown';
      if (!empty($item['openfda']['dosage_form'][0])) {
        $form = $item['openfda']['dosage_form'][0];
      } elseif (!empty($item['openfda']['route'][0])) {
        $form = $item['openfda']['route'][0];
      }
      $med->setToedieningsvorm(substr($form, 0, 50));

      // 3. Sterkte (Strength from Active Ingredient)
      // Tries to extract patterns like "500 mg", "2%", "10ml", "2X"
      $strengthValue = null;
      $ingredientText = $item['active_ingredient'][0] ?? '';

      // Regex to find number followed by unit (mg, g, ml, mcg, %, X)
      if (preg_match('/(\d+(\.\d+)?\s?(mg|g|ml|mcg|%|X))/i', $ingredientText, $matches)) {
        $strengthValue = $matches[0];
      } elseif (!empty($ingredientText)) {
        // Fallback: take first 50 chars of the text
        $strengthValue = substr($ingredientText, 0, 50);
      }
      $med->setSterkte($strengthValue);

      // 4. Beschrijving (Description)
      // Mapped from 'purpose' OR 'indications_and_usage'
      $descArray = $item['purpose'] ?? $item['indications_and_usage'] ?? $item['description'] ?? ['No description available.'];
      $descText = \is_array($descArray) ? implode(' ', $descArray) : (string) $descArray;

      $med->setBeschrijving(substr($descText, 0, 2000));

      // 5. Bijsluiter (Leaflet / Warnings / Dosage info)
      // Mapped from 'dosage_and_administration' (very important) AND 'warnings'
      $dosageInfo = $item['dosage_and_administration'][0] ?? '';
      $warnings = $item['warnings'][0] ?? '';

      // Combine dosage and warnings for the leaflet field
      $fullLeaflet = "DOSAGE: " . $dosageInfo . "\n\nWARNINGS: " . $warnings;
      $med->setBijsluiter(substr($fullLeaflet, 0, 2000));

      $this->entityManager->persist($med);
      $count++;
      $io->progressAdvance();
    }

    $this->entityManager->flush();
    $io->progressFinish();

    $io->success(\sprintf('Successfully imported %d medicines based on the new structure!', $count));

    return Command::SUCCESS;
  }
}