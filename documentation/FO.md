# Functioneel Ontwerp - Turfje

## Doel

Dit document beschrijft het functioneel ontwerp voor de applicatie **Turfje**.
Het doel van de applicatie is om patiënten te helpen met hun medicijnen. Ook moet het de behandelaar inzicht geven in het medicijngebruik van de patiënten.

Turfje wordt ontwikkeld omdat er momenteel geen applicatie bestaat die medicijngebruik en planning combineert met het delen van deze gegevens met een behandelaar.

Het document geeft een overzicht van functionele wensen van de gebruiker. Dit dient daarom ook gebruikt te worden als leidraad voor de ontwikkeling van de applicatie.

---

## Gebruikers en Rollen

De applicatie kent de volgende rollen:

- **Patiënt** – Dit is de hoofdgebruiker van de applicatie. De patiënt houdt in de applicatie zijn medicijngebruik bij.
- **Behandelaar** – Deze gebruiker zal het medicijngebruik (turven) van zijn/haar patiënten kunnen inzien. Ook kan deze rol ondersteuning bieden aan een patiënt door schema’s op te stellen, medicijnen te koppelen en feedback te geven over het medicijngebruik. Een behandelaar kan iedere persoon zijn die een patiënt wil ondersteunen. Bijvoorbeeld een dokter, ouder of vriend.
- **Administrator** – Deze rol bestaat om andere gebruikers technische hulp te bieden. Ook zal deze gebruiker systeemonderhoud verrichten.

---

## Scope

### Binnen scope

Turfje zal de volgende onderdelen ondersteunen:

- Het inloggen in de applicatie als patiënt, behandelaar of administrator.
- Het bijhouden van medicijninname van de patiënt via een turfsysteem.
- Het maken van een schema om te bepalen wanneer medicijnen ingenomen dienen te worden.
- Deze gegevens inzichtelijk maken voor de behandelende arts.
- Het versturen van een herinnering om de patiënt te helpen bij het tijdig gebruiken van de medicijnen.
- Een connectie met een externe medicijnendatabase om patiënten eenvoudig informatie te kunnen bieden over hun medicijnen. (met disclaimer dat deze informatie onjuist kan zijn. afkomstig van fda.gov)
- Een patiënt kan berichten achterlaten die de arts kan lezen. Bijvoorbeeld het beschrijven van klachten of bijwerkingen bij bepaalde medicijnen.
- De mogelijkheid bieden voor een behandelaar om feedback te geven op berichten van de patiënt.

### Buiten scope

Wat Turfje **niet** zal doen:

- Advies geven over medicijngebruik
- Recepten of herhaalrecepten opvragen bij de apotheek.
- Directe koppeling leggen met de verzekering.
- Het betalen van medicijnen.
- Integratie met slimme pillendoosjes of andere hardware
- Het delen van patiëntgegevens met derden anders dan de behandelaar.

---

## Requirements

We sorteren de requirements op prioriteit, waar 1 het hoogste prioriteitsniveau is en 3 het laagste.

### Algemene Gebruiker

| Wensnummer | Beschrijving                                                                     | Prioriteit | Geschatte grootte |
| ---------- | -------------------------------------------------------------------------------- | ---------- | ----------------- |
| T1         | Inloggen in de applicatie om persoonlijke gegevens in te zien en op te slaan.    | 1          |                   |
| T3         | Andere gebruikers koppelen aan mijn account zodat zij mijn gegevens kunnen zien. | 1          |                   |
| T2         | Accountgegevens kunnen aanpassen of verwijderen.                                 | 2          |                   |

---

### Behandelaar

| Wensnummer | Beschrijving                                           | Prioriteit | Geschatte grootte |
| ---------- | ------------------------------------------------------ | ---------- | ----------------- |
| T5         | Schema voor de patiënt opstellen.                      | 1          |                   |
| T6         | Medicijnen toevoegen aan de patiënt.                   | 1          |                   |
| T7         | Medicijngebruik (turven/schemas) van patiënten inzien. | 1          |                   |
| T4         | Direct feedback kunnen geven aan patiënten.            | 3          |                   |

---

### Patiënt

| Wensnummer | Beschrijving                                            | Prioriteit | Geschatte grootte |
| ---------- | ------------------------------------------------------- | ---------- | ----------------- |
| T10        | Bijhouden hoe vaak medicijnen zijn ingenomen.           | 1          |                   |
| T11        | Schema kunnen opstellen voor medicijngebruik.           | 1          |                   |
| T8         | Medicatiegegevens kunnen opzoeken.                      | 2          |                   |
| T13        | Reminder ontvangen vóór medicijninname.                 | 2          |                   |
| T14        | Reminder ontvangen bij medicijninname.                  | 2          |                   |
| T9         | Medicijninformatie kunnen bewaren.                      | 3          |                   |
| T12        | Feedback kunnen geven aan behandelaar.                  | 3          |                   |
| T15        | Inzien bij welke apotheek medicijnen verkrijgbaar zijn. | 3          |                   |

---

### Administrator

| Wensnummer | Beschrijving                                                 | Prioriteit | Geschatte grootte |
| ---------- | ------------------------------------------------------------ | ---------- | ----------------- |
| T16        | Gebruikers kunnen beheren (rechten, wachtwoorden, accounts). | 1          |                   |
| T17        | Overzichtspagina voor beheertaken.                           | 1          |                   |

---

### Toelichting Prioriteit

- 1 = Must have – Nodig voor basisfunctionaliteit.
- 2 = Should have – Maakt de applicatie gebruiksvriendelijker.
- 3 = Nice to have – Extra toevoeging.

---

## Use Cases

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/usecasesv2.png" alt="Usecase Diagram" width="500"/>

---

## Features

### F1 – Gebruikersbeheer

#### Beschrijving

Functionaliteit voor registratie, inloggen, gegevensbeheer en koppeling tussen gebruikers.

#### Sub-features

**T0 – Registreren account**

- Gebruiker maakt account aan met e-mailadres, wachtwoord en rol.

**T1 – Inloggen functionaliteit**

- Login-scherm met invoervelden voor e-mail en wachtwoord.
- Homepagina per rol.
- "Wachtwoord vergeten" functionaliteit.

**T2 – Account verwijderen/deactiveren**

- Gebruiker kan account laten verwijderen of tijdelijk deactiveren.

**T3 – Koppelen accounts**

- Patiënt kan unieke koppelcode genereren en delen met behandelaar of andere gebruiker.
- Mogelijkheid koppelingen te beëindigen.

**T16 – Gebruikers beheren (Admin)**

- Dashboard met overzicht van gebruikers.
- Rechten aanpassen, wachtwoord resetten, accounts verwijderen of uitschakelen.
- Mogelijkheid PSK resetten.

**T17 – Beheeromgeving met overzicht (Admin)**

- Dashboard met zoekfunctie op gebruikersnaam.
- Alle beheeropties per gebruiker zichtbaar (reset, verwijderen, koppelen, PSK reset).

---

### F2 – Schema’s en Turven

#### Beschrijving

Patiënt en behandelaar kunnen medicatieschema’s aanmaken, beheren en medicijninname registreren.

#### Sub-features

**T6 – Medicijnen toevoegen**

- Patiënt en behandelaar kunnen medicijnen toevoegen of verwijderen.

**T11 / T5 – Medicatieschema opstellen**

- Schema met medicijnnaam, dosering, tijdstip, duur en herhaling.
- Weergave in kalender, mogelijkheid pauzeren of verwijderen.

**T10 / T7 – Innamegeschiedenis bijhouden**

- Turfsysteem om medicijngebruik te registreren.
- Inzicht in gebruikspatronen, statistieken (per week/maand), export als CSV.
- Behandelaar kan gebruikspatronen van gekoppelde patiënten inzien.

---

### F3 – Medicatie Informatie

#### Beschrijving

Raadplegen en opslaan van medicatiegegevens, inclusief apotheekinformatie.

#### Sub-features

**T8 – Medicatiegegevens opzoeken**

- Zoeken op medicijnnaam of merknaam.
- Weergave: naam, dosering, werkzame stoffen, bijwerkingen, bijsluiter.

**T9 – Medicijninformatie bewaren**

- Medicijn toevoegen aan "Mijn Medicijnen".
- Zoeken en verwijderen binnen opgeslagen medicijnen.

**T15 – Apotheekinformatie** (nice to have)

- Lijst met apotheken die medicijn verkopen. (Indien mogelijk middels een api. Wordt op dit moment nog onderzocht)
- Zoeken op postcode of apotheeknaam.

---

### F4 – Notificaties en Herinneringen

#### Beschrijving

Herinneringen sturen voor medicijninname.

#### Sub-features

**T14 – Reminder bij tijd voor inname**

- Melding bij tijdstip van medicijninname.
- Bevestiging mogelijk.
- Herhaalmelding na 15 minuten indien geen bevestiging.

**T13 – Reminder bij bijna tijd voor inname**

- Notificatie instellen (bijv. 15 minuten vooraf).
- Per medicijn instelbaar.

---

### F5 – Feedback

#### Beschrijving

Patiënt en behandelaar kunnen feedback delen over medicijngebruik.

#### Sub-features

**T12 / T4 – Feedback**

- Patiënt kan formulier invullen met bijwerkingen of opmerkingen.
- Feedback zichtbaar voor gekoppelde accounts.
- Behandelaar kan reageren op feedback.

---

## Wireframe / Mockup

### Intro

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/1-Intro.png" alt="Intro" width="500"/>

### Inloggen

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/2-Login.png" alt="Login" width="500"/>

### Registreren

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/3-Registreren.png" alt="Registreren" width="500"/>

### Dashboard

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/4-Dashboard.png" alt="Dashboard" width="500"/>

### Instellingen

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/5-Instellingen.png" alt="Instellingen" width="500"/>

### Schemas

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/6-Schemas.png" alt="Schemas" width="500"/>

### Medicijnen

<img src="https://r2.fivemanage.com/wqMuL8aYWTwEuuMyYBW4d/7-Medicijnen.png" alt="Medicijnen" width="500"/>

## Randvoorwaarden

_De applicatie moet voldoen aan minimale eisen voor performance, toegankelijkheid en veiligheid._
