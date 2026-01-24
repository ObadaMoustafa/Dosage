# Technisch Ontwerp – Turfje

# 1. Technische Stack

- **Frontend**: React Native (Android & iOS)
- **Backend**: Symfony
- **Database**: sqlite
- **Authenticatie**: JWT (kortstondige tokens + refresh via beveiligde opslag)
- **Data-integriteit**: Gevoelige gegevens (bijv. turven, feedback) worden **digitaal ondertekend** met OpenSSL (privésleutel veilig opgeslagen op het apparaat).
- **Geen betaalde of externe SaaS-diensten**: Alles is self-hosted of maakt gebruik van gratis, openbare API’s.

---

# 2. Kernmodules

## 2.1 Authenticatie & Gebruikersbeheer

- Gebruikers registreren/aanmelden met e-mail, wachtwoord en rol (`patient`, `behandelaar`, `administrator`).
- JWT wordt uitgegeven bij inloggen en veilig opgeslagen (versleuteld op het apparaat).
- Wachtwoordherstel via e-mailtoken.
- Accountverwijdering vereist bevestiging (via e-mail of in de app).
- **Accountkoppeling** via een eenmalige koppelcode (gegenereerd door patiënt, ingevoerd door behandelaar/admin).

## 2.2 Medicatie & Schema’s

- Gebruikers kunnen:
  - Medicijnen toevoegen/verwijderen uit een **openbare medicijnen-database** (bijv. openFDA of vergelijkbare gratis bron).
  - Schema’s aanmaken/bewerken/verwijderen (medicijn, dosering, tijdstip, frequentie: dagelijks/wekelijks/tijdelijk).
  - "Turven": daadwerkelijke inname registreren.
- Schema’s ondersteunen pauzeren, bewerken en verwijderen.
- Kalenderweergave toont aankomende innames.

## 2.3 Databeledeling

- Alleen **gekoppelde gebruikers** (patiënt ↔ behandelaar) kunnen inzien:
  - Turfgeschiedenis
  - Schema’s
  - Feedback
- Alle schrijfacties van gevoelige data bevatten een **digitale handtekening** voor integriteit en non-repudiation.
- Beheerders (**admins**) **kunnen geen patiëntgegevens inzien**, tenzij expliciet gekoppeld.

## 2.4 Notificaties & Herinneringen

- **Twee lokale pushmeldingen** per geplande dosis:
  1. **Voorherinnering** (bijv. 15 minuten van tevoren) – optioneel per medicijn.
  2. **Tijdstip-herinnering** – verplicht.
- Geen bevestiging binnen 15 minuten → herhaalde melding.
- Alles **offline-first**: werkt zonder internet, synchroniseert bij verbinding.
- **Geen backend-betrokkenheid** bij het verzenden van meldingen.

## 2.5 Medicatie-informatie & Apotheekzoeker

- Zoek openbare medicijneninfo op naam/merk: naam, dosering, werkzame stoffen, bijwerkingen, bijsluiter.
- Medicijnen opslaan in “Mijn Medicijnen”.
- **Apotheekzoeker** (optioneel): alleen indien er een **gratis, openbare Nederlandse apotheek-API** bestaat. Zo niet, dan wordt dit weggelaten.

## 2.6 Feedbacksysteem

- Patiënten kunnen tekstfeedback geven per medicijn (bijv. bijwerkingen, effectiviteit).
- Behandelaren kunnen direct reageren.
- Alle berichten worden opgeslagen met tijdstempel en digitaal ondertekend.
- Zichtbaar in een apart feedbackoverzicht.

## 2.7 Beheeromgeving (Laravel Web Dashboard)

- Gebouwd met Bootstrap (geen externe UI-bibliotheken).
- Admin kan:
  - Alle gebruikers bekijken/zoeken
  - Wachtwoorden resetten
  - Accounts in-/uitschakelen of verwijderen
  - Gebruikersrollen wijzigen
  - Handmatig patiënten koppelen aan behandelaars
  - **Kan geen turven, medicijnen of feedback inzien** (privacy by design)

---

# 3. Beveiliging & Privacy

- **Geen delen van patiëntgegevens met derden**, behalve met de gekoppelde behandelaar.
- Gevoelige schrijfacties (turven, feedback) worden **digitaal ondertekend** (Laravel `openssl_sign`).
- JWT’s veilig opgeslagen:
  - Android: Versleutelde SharedPreferences + Android Keystore
  - iOS: Keychain
- Database versleuteld bij inactiviteit (PostgreSQL TDE of OS-niveau).
- Geen `htmlspecialchars` gebruikt — frontend doet escaping via React Native’s veilige rendering.
- Admin-toegang is **rol-beperkt** en wordt gelogd.

---

# 4. Database Schema

![Db overview](https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/ERD.png)

## Table: Gebruikers

| Column           | Type        | Description                 |
| ---------------- | ----------- | --------------------------- |
| id               | uuid [pk]   |                             |
| voornaam         | text        | voornaam van gebruiker      |
| achternaam       | text        | achternaam van gebruiker    |
| rol              | varchar(20) | patient, behandelaar, admin |
| publieke_sleutel | text        |                             |
| profielgegevens  | text        | versleuteld                 |
| aangemaakt_op    | timestamp   |                             |

---

## Table: Gebruiker_koppelingen

| Column                  | Type                        | Description                         |
| ----------------------- | --------------------------- | ----------------------------------- |
| id                      | uuid [pk]                   |                                     |
| gebruiker_id            | uuid [ref: > Gebruikers.id] |                                     |
| gekoppelde_gebruiker_id | uuid [ref: > Gebruikers.id] |                                     |
| rechten                 | json                        | {"lezen": true, "schrijven": false} |
| status                  | varchar(20)                 |                                     |
| aangemaakt_op           | timestamp                   |                                     |

---

## Table: Medicijnen

| Column          | Type         | Description |
| --------------- | ------------ | ----------- |
| id              | uuid [pk]    |             |
| naam            | varchar(100) |             |
| toedieningsvorm | varchar(50)  |             |
| sterkte         | varchar(50)  |             |
| beschrijving    | text         |             |
| bijsluiter      | clob         |             |
| aangemaakt_op   | timestamp    |             |

---

## Table: Gebruiker_medicijn

| Column        | Type                        | Description |
| ------------- | --------------------------- | ----------- |
| id            | uuid [pk]                   |             |
| gebruiker_id  | uuid [ref: > Gebruikers.id] |             |
| medicijn      | text                        | versleuteld |
| aangemaakt_op | timestamp                   |             |

---

## Table: Gebruiker_medicijn_gebruik

| Column          | Type                                          | Description |
| --------------- | --------------------------------------------- | ----------- |
| id              | uuid [pk]                                     |             |
| gmn_id          | integer [ref: > Gebruiker_medicijn.id]        |             |
| gms_id          | integer [ref: > Gebruiker_medicijn_schema.id] |             |
| medicijn_turven | text                                          | versleuteld |
| aangemaakt_op   | timestamp                                     |             |

---

## Table: Gebruiker_medicijn_schema

| Column          | Type                                   | Description |
| --------------- | -------------------------------------- | ----------- |
| id              | uuid [pk]                              |             |
| gmn_id          | integer [ref: > Gebruiker_medicijn.id] |             |
| medicijn_schema | text                                   | versleuteld |
| aangemaakt_op   | timestamp                              |             |

---

## Table: Log_meldingen

| Column    | Type           | Description |
| --------- | -------------- | ----------- |
| id        | integer [pk]   |             |
| tijdstip  | date           |             |
| onderdeel | varchar2(200)  |             |
| melding   | varchar2(2000) |             |

---

## Table: Gebruiker_auth

| Column          | Type          | Description |
| --------------- | ------------- | ----------- |
| id              | uuid [pk]     |             |
| email           | varchar2(255) | username    |
| wachtwoord_hash | varchar2(255) |             |
| laatste_login   | timestamp     |             |
| aangemaakt_op   | timestamp     |             |
| bijgewerkt_op   | timestamp     |             |

---

# 5. Voorgestelde API-endpoints

Alle endpoints geven JSON terug. Authenticatie vereist, tenzij anders aangegeven.

## 🔐 Authenticatie

| Status | Endpoint                    | Methode | Rol             | Beschrijving                                           |
| :----- | :-------------------------- | :------ | :-------------- | :----------------------------------------------------- |
| ✅     | `/api/auth/register`        | POST    | Iedereen        | Nieuwe gebruiker registreren (e-mail, wachtwoord, rol) |
| ✅     | `/api/auth/login`           | POST    | Iedereen        | Inloggen en JWT ontvangen                              |
| ❌     | `/api/auth/forgot-password` | POST    | Iedereen        | E-mail voor wachtwoordherstel aanvragen                |
| ❌     | `/api/auth/reset-password`  | POST    | Iedereen        | Wachtwoord resetten met token                          |
| ✅     | `/api/auth/change-password` | POST    | Geauthenticeerd | Wachtwoord wijzigen                                    |
| ✅     | `/api/auth/me`              | GET     | Geauthenticeerd | Huidig gebruikersprofiel ophalen                       |
| ✅     | `/api/auth/me`              | DELETE  | Geauthenticeerd | Account verwijderen                                    |

## 🔗 Gebruikers Koppelingen

| Status | Endpoint                   | Methode | Rol             | Beschrijving                                                   |
| :----- | :------------------------- | :------ | :-------------- | :------------------------------------------------------------- |
| ✅     | `/api/pairing/invite`      | POST    | ROLE_PATIENT    | Genereer koppelcode (15 min). Body: `{ "type": "THERAPIST" }`  |
| ✅     | `/api/pairing/link`        | POST    | Geauthenticeerd | Account koppelen met code. Body: `{ "code": "12345" }`         |
| ✅     | `/api/pairing/viewers`     | GET     | Geauthenticeerd | (Patiënt) Lijst van mensen die toegang hebben tot jouw dossier |
| ✅     | `/api/pairing/subjects`    | GET     | Geauthenticeerd | (Behandelaar) Lijst van mensen die jij behandelt of volgt      |
| ✅     | `/api/pairing/unlink/{id}` | DELETE  | Geauthenticeerd | Verbinding verbreken met een specifieke gebruiker              |

## 💊 Medicijnen

| Status | Endpoint                             | Methode | Rol             | Beschrijving                           |
| :----- | :----------------------------------- | :------ | :-------------- | :------------------------------------- |
| ✅     | `/api/medicines/search?q=<medicine>` | GET     | Geauthenticeerd | Zoeken in openbare medicijnen-database |
| ✅     | `/api/my-medicines`                  | POST    | Patiënt         | Medicijn opslaan in “Mijn Medicijnen”  |
| ✅     | `/api/my-medicines`                  | GET     | Patiënt         | Opgeslagen medicijnen tonen            |
| ✅     | `/api/my-medicines/{id}`             | GET     | Patient         | Details van medicijn ophalen           |
| ✅     | `/api/medications/{id}`              | DELETE  | Geauthenticeerd | Medicijn uit lijst verwijderen         |

## 🗓️ Schema’s & Turven

| Status | Endpoint              | Methode    | Rol                             | Beschrijving                        |
| :----- | :-------------------- | :--------- | :------------------------------ | :---------------------------------- |
| ❌     | `/api/schedules`      | POST       | Patiënt/Behandelaar             | Nieuw medicatieschema aanmaken      |
| ❌     | `/api/schedules`      | GET        | Patiënt/Behandelaar             | Alle schema’s tonen                 |
| ❌     | `/api/schedules/{id}` | PUT/DELETE | Eigenaar/Behandelaar            | Schema bewerken of verwijderen      |
| ❌     | `/api/logs`           | POST       | Patiënt                         | Medicijninname registreren ("Turf") |
| ❌     | `/api/logs`           | GET        | Patiënt/Behandelaar (gekoppeld) | Turfgeschiedenis inzien             |
| ❌     | `/api/logs/stats`     | GET        | Patiënt/Behandelaar             | Statistieken (dagelijks/wekelijks)  |

## 💬 Feedback

| Status | Endpoint                   | Methode | Rol                             | Beschrijving                 |
| :----- | :------------------------- | :------ | :------------------------------ | :--------------------------- |
| ❌     | `/api/feedback`            | POST    | Patiënt                         | Feedback geven over medicijn |
| ❌     | `/api/feedback`            | GET     | Patiënt/Behandelaar (gekoppeld) | Feedbackgeschiedenis tonen   |
| ❌     | `/api/feedback/{id}/reply` | POST    | Behandelaar                     | Reageren op patiëntfeedback  |

## 👨‍💼 Beheeromgeving (Web-routes)

| Status | Endpoint                           | Methode | Rol   | Beschrijving                           |
| :----- | :--------------------------------- | :------ | :---- | :------------------------------------- |
| ❌     | `/admin/users`                     | GET     | Admin | Alle gebruikers tonen                  |
| ❌     | `/admin/users/{id}/role`           | PUT     | Admin | Gebruikersrol wijzigen                 |
| ❌     | `/admin/users/{id}/reset-password` | POST    | Admin | Wachtwoord resetten                    |
| ❌     | `/admin/users/{id}/toggle-status`  | POST    | Admin | Account in-/uitschakelen               |
| ❌     | `/admin/pair`                      | POST    | Admin | Handmatig patiënt-behandelaar koppelen |

> **Opmerking**: Notificaties zijn **lokaal** en worden beheerd door React Native (bijv. via `@notifee/react-native`). Er worden **geen server-pushed meldingen** gebruikt.
