# 📚 Turfje API Documentation (Current Status)

This document covers all implemented endpoints made till now.

---

## 🔐 1. Authentication

**Base URL:** `/api/auth`

### **1.1 Register**

- **Endpoint:** `POST /register`
- **Description:** Create a new user account.
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "strongPassword123",
    "voornaam": "John",
    "achternaam": "Doe"
  }
  ```

### **1.2 Login**

- **Endpoint:** `POST /login_check`
- **Description:** Authenticate and receive a JWT Token.
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response:** `{ "token": "ey..." }`

### **1.3 Get Current User**

- **Endpoint:** `GET /me`
- **Description:** Retrieve profile details of the logged-in user.
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 💊 2. Medicines (Mijn Medicijnen)

**Base URL:** `/api/medicines/me`

### **2.1 Add Medicine**

- **Endpoint:** `POST /`
- **Description:** Add a new medicine to the user's list.
- **Body (JSON):**
  ```json
  {
    "medicijn_naam": "Paracetamol", // required
    "toedieningsvorm": "Tablet",
    "sterkte": "400 mg", // required
    "beschrijving": "Neem 2 tablet na het eten bij pijn.",
    "bijsluiter": "Niet meer dan 8 tabletten per dag."
  }
  ```

### **2.2 List All Medicines**

- **Endpoint:** `GET /`
- **Description:** Get a list of all medicines owned by the current user.

### **2.3 Get a specific medicine**

- **Endpoint:** `GET /{id}`
- **Description:** Get a medicine by uuid.

### **2.4 Edit Medicine**

- **Endpoint:** `PUT /{id}`
- **Body (JSON):**

```json
{
  "medicijn_naam": "New info",
  "toedieningsvorm": "New info",
  "sterkte": "New info",
  "beschrijving": "New info",
  "bijsluiter": "New info"
}
```

### **2.5 Delete Medicine**

- **Endpoint:** `DELETE /{id}`

---

## ⚕️ 2.0.1 Medicines Storage (Medicijnen)

**Base URL:** `/api/medicines`

### **2.0.1.1 List All Medicines [ADMIN]**

- **Endpoint:** `GET /`
- **Description:** Get a list of all medicines in the Medicijnen.

### **2.0.1.2 Add a medicine [ADMIN]**

- **Endpoint:** `POST /add`
- **Description:** Get a list of all medicines in the Medicijnen.
- **Body (JSON - required):**

```json
{
  "naam": "Paracetamol",
  "toedieningsvorm": "drank",
  "sterkte": "10 mg",
  "beschrijving": "Pain reliever and fever reducer.",
  "bijsluiter": "Take 1 tablet every 4-6 hours. Do not exceed 8 tablets in 24 hours."
}
```

### **2.0.1.3 search a medicine [all_roles]**

- **Endpoint:** `GET /search?q={med_name}`
- **Description:** Get a list of all medicines in the Medicijnen.

---

## 🔗 3. Pairing (Koppelingen)

**Base URL:** `/api/pairing`

### **3.1 Send Invite**

- **Endpoint:** `POST /invite`
- **Description:** Invite another user (Patient or Therapist) to connect.
- **Body (JSON):**
  ```json
  {
    "tybe": "THERAPIST" || "TRUSTED"
  }
  ```

### **3.2 List Connections**

- **Endpoint:** `GET /`
- **Description:** Show all active connections.

### **3.3 Accept Invite**

- **Endpoint:** `POST /link`
- **Description:** Accept a connection request using the generated number with other user.
- **Body (JSON):**
  ```json
  {
    "code": "_generated_number_"
  }
  ```

### **3.4 Unlink User**

- **Endpoint:** `POST /unlink/:userId`
- **Description:** Unlink a therapist or a trusted person.

---

## 📝 4. Logs / Turven (Current Focus)

**Base URL:** `/api/logs`

### **4.1 Create Log (Turf)**

- **Endpoint:** `POST /`
- **Description:** Record a medication intake.
- **Body (JSON):**
  ```json
  {
    "gmn_id": "UUID-OF-MEDICINE", // Required
    "medicijn_turven": 1, // Optional (Default: 1)
    "gms_id": "UUID-OF-SCHEDULE", // Optional (If linked to schedule)
    "aangemaakt_op": "2026-01-24..." // Optional (Default: Now)
  }
  ```

### **4.2 Get Logs (Flexible Endpoint)**

- **Endpoint:** `GET /`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### **Use Case A: Default (No Params)**

- **Request:** `GET /api/logs`
- **Scenario:** The app opens the "History" tab and wants to show _everything_.
- **Result:** Returns all logs for the current user, sorted by newest first.

#### **Use Case B: Filter by Date (Today's View)**

- **Request:** `GET /api/logs?date=2026-01-24`
- **Scenario:** The user is on the "Daily View" dashboard.
- **Result:** Returns only logs created on that specific day (00:00 - 23:59).

#### **Use Case C: Filter by Date Range (Statistics)**

- **Request:** `GET /api/logs?from=2026-01-01&to=2026-01-31`
- **Scenario:** Generating a monthly chart or report.
- **Result:** Returns logs within that specific period.

#### **Use Case D: Filter by Medicine (Specific History)**

- **Request:** `GET /api/logs?gmn_id=UUID-OF-MEDICINE`
- **Scenario:** User clicks on "Paracetamol" details and wants to see when they last took it.
- **Result:** Returns history for that specific medicine only.

#### **Use Case E: Doctor Viewing Patient (Remote Monitoring)**

- **Request:** `GET /api/logs?patient_id=UUID-OF-PATIENT`
- **Scenario:** A connected doctor/therapist wants to check if their patient is adhering to medication.
- **Result:** Returns logs for that specific patient (requires active pairing).

### **4.3 Delete Log (Undo)**

- **Endpoint:** `DELETE /{id}`
- **Description:** Remove a log entry (e.g., if clicked by mistake).

---

## 📅 5. Schedules (Medicijn Schemas)

**Base URL:** `/api/schema`

### **5.1 List All Schemas**

- **Endpoint:** `GET /`
- **Description:** Get all active schedules for the current user.
- **Response:** Returns an array including `dagen` (object), `tijden` (array), and current `innemen_status`.

### **5.2 Create Schema**

- **Endpoint:** `POST /`
- **Description:** Create a new schedule for a specific medicine.
- **Rules:** One schema per medicine (`gmn_id`). All 7 days are required in the `dagen` object.
- **Body (JSON):**
  ```json
  {
    "gmn_id": "UUID-OF-MEDICINE", // Required
    "dagen": {
      "maandag": true,
      "dinsdag": false,
      "woensdag": true,
      "donderdag": false,
      "vrijdag": true,
      "zaterdag": false,
      "zondag": false
    },
    "tijden": ["08:00", "20:00"], // At least one time
    "aantal": 1,
    "beschrijving": "Take with water"
  }
  ```

### **5.3 Update Schema (Edit Info)**

- **Endpoint:** `PUT /update_schema/{id}`
- **Description:** Update schedule details. Supports changing the medicine (`gmn_id`) if the new medicine doesn't have a schema yet.
- **Body (JSON):**
  ```json
  {
  "gmn_id": "UUID-OF-NEW-MEDICINE", // Optional (can change medicine)
  "dagen": { "maandag": true, ... }, // Required (Full object)
  "tijden": ["09:00"],
  "aantal": 2,
  "beschrijving": "New instructions"
  }
  ```

### **5.4 Update Status (Taken/Missed)**

- **Endpoint:** `POST /update_status`
- **Description:** Mark a schedule as "Taken" (optijd) or "Missed" (gemist).
- **Auto-Log:** If status is `optijd`, a new record is **automatically created** in Logs (Turven) using the schema's amount.
- **Body (JSON):**
  ```json
  {
    "id": "UUID-OF-SCHEMA",
    "innemen_status": "optijd" // or "gemist"
  }
  ```

### **5.5 Delete Schema**

- **Endpoint:** `DELETE /{id}`
- **Description:** Remove a schedule permanently.

---

##  6. Console Commands

### **6.1 Seed Global Medicines**

- **Command:** `php bin/console app:seed-medicines`
- **Description:** Seeds 1000 real Dutch medicines into the global `Medicijnen` table.
- **Note:** Does **not** purge existing data (Safe to run).

### **6.2 Seed Patient Medicines**

- **Command:** `php bin/console app:seed-patient-medicines`
- **Description:** Copies 5 random medicines from the global list to patients (User IDs 7, 8, 9, 10) for testing.
