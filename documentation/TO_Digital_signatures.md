# RSA Server met Digital Signatures

## Overzicht

Dit project implementeert een RSA-gebaseerde server-client communicatie met digitale handtekeningen voor extra beveiliging. Het systeem biedt:

- **Encryptie**: RSA-2048 voor veilige data-uitwisseling
- **Digital Signatures**: SHA-256 voor authenticiteit en integriteit
- **Key Management**: Automatische sleutelgeneratie en -opslag

## Beveiligingsfeatures

### 1. **Digital Signatures (Nieuw!)**

- **Authenticiteit**: Verifieert de identiteit van de verzender
- **Integriteit**: Detecteert wijzigingen in berichten
- **Non-repudiation**: Verzender kan niet ontkennen het bericht te hebben gestuurd
- **SHA-256**: Gebruikt moderne hashing algoritme

### 2. **RSA Encryptie**

- **2048-bit** sleutels voor sterke beveiliging
- **OAEP padding** voor veilige encryptie
- **Asymmetrische encryptie** voor veilige sleuteluitwisseling

## Hoe Digital Signatures Werken

### Client → Server

1. Client maakt handtekening van `email + public_key`
2. Server verifieert handtekening met client's public key
3. Alleen geverifieerde clients krijgen toegang

### Server → Client

1. Server maakt handtekening van response data
2. Client verifieert handtekening met server's public key
3. Alleen geverifieerde responses worden geaccepteerd

## Bestanden

- `server.php` - RSA server met signature verificatie
- `client.php` - RSA client met signature creatie/verificatie
- `test_signatures.php` - Test script voor digital signatures
- `users.json` - Gebruikers database (auto-generated)
- `server_keys.json` - Server RSA sleutels (auto-generated)
- `client_*_keys.json` - Client RSA sleutels per gebruiker (auto-generated)

## Gebruik

### 1. Server Starten

```bash
php server.php
```

### 2. Client Verbinden

```bash
php client.php
```

### 3. Digital Signatures Testen

```bash
php test_signatures.php
```

## API Changes

### Client Request (Nieuw format)

```json
{
  "email": "user@example.com",
  "public_key": "-----BEGIN PUBLIC KEY-----...",
  "signature": "base64_encoded_signature"
}
```

### Server Response (Nieuw format)

```json
{
  "server_public_key": "-----BEGIN PUBLIC KEY-----...",
  "message": "encrypted_message_base64",
  "signature": "base64_encoded_signature"
}
```

## Beveiligingsvoordelen

### Zonder Digital Signatures (Oud)

- ❌ Man-in-the-middle aanvallen mogelijk
- ❌ Geen garantie van data integriteit
- ❌ Geen authenticatie van verzender

### Met Digital Signatures (Nieuw)

- ✅ Bescherming tegen man-in-the-middle
- ✅ Gegarandeerde data integriteit
- ✅ Sterke authenticatie van verzender
- ✅ Non-repudiation van berichten

## Test Scenarios

### 1. Normale Communicatie

```
Client → Server: Email + Public Key + Signature
Server: ✅ Signature verified
Server → Client: Response + Signature
Client: ✅ Server verified
```

### 2. Gecompromitteerde Signature

```
Attacker → Server: Email + Public Key + Fake Signature
Server: ❌ Invalid signature → Connection rejected
```

### 3. Data Tampering

```
Server → Client: Response + Signature
Attacker: Modifies response
Client: ❌ Signature verification fails → Response rejected
```

## Technische Details

### Signature Algoritme

- **Algorithm**: RSA-SHA256
- **Key Size**: 2048 bits
- **Padding**: PKCS#1 v1.5 (default voor openssl_sign)
- **Hash**: SHA-256

### Code Example

```php
// Signature maken
openssl_sign($data, $signature, $privateKey, OPENSSL_ALGO_SHA256);
$signatureBase64 = base64_encode($signature);

// Signature verifiëren
$result = openssl_verify($data, $signature, $publicKey, OPENSSL_ALGO_SHA256);
// $result: 1 = valid, 0 = invalid, -1 = error
```
