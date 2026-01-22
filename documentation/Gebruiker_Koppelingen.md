# 📘 Technical Specs: Patient Pairing System (Patient-Controlled)

## 1. Overview

The system allows a **Patient** to generate a specific type of pairing code. The control lies with the patient to decide whether the code is for a **Therapist** (Write Access) or **Family** (Read Access).

---

## 2. Database Schema

### A. `PairingCode` (Temporary Table)

Stores the generated code and the intended connection type.

| Column            | Type     | Description                      |
| :---------------- | :------- | :------------------------------- |
| `code`            | String   | Unique 5-digit code.             |
| `gebruiker_id`    | UUID     | The Patient.                     |
| `type_verbinding` | String   | **'THERAPIST'** or **'FAMILY'**. |
| `expires_at`      | DateTime | Expiration time (15 mins).       |

### B. `GebruikerKoppelingen` (Persistent Connections)

The main table for storing relationships.

| Column                    | Type     | Description                                      |
| :------------------------ | :------- | :----------------------------------------------- |
| `id`                      | UUID     | Unique identifier.                               |
| `gebruiker_id`            | UUID     | The Patient.                                     |
| `gekoppelde_gebruiker_id` | UUID     | The Therapist or Family Member.                  |
| `toegangsniveau`          | String   | `'FULL_ACCESS'` (Write) or `'READ_ONLY'` (Read). |
| `type_verbinding`         | String   | `'THERAPIST'` or `'FAMILY'`.                     |
| `status`                  | String   | **`'active'`** or **`'pending'`**.               |
| `aangemaakt_op`           | DateTime | Creation timestamp.                              |

---

## 3. Workflow & Endpoints

### A. Generating the Code (Patient Side)

**User Story:** As a Patient, I want to create a code specifically for a doctor OR a family member.

- **Endpoint:** `POST /api/pairing/code`
- **Role:** Patient only.
- **Payload:** `{ "type": "THERAPIST" }` OR `{ "type": "FAMILY" }`
- **Backend Logic (Pre-Validation):**
  1.  **If type is 'THERAPIST':**
      - Check `GebruikerKoppelingen`. Does this patient _already_ have an active therapist?
      - **IF YES:** Return `403 Forbidden`: "You already have a main therapist. Unlink them first."
      - **IF NO:** Generate code stored with `type_verbinding = 'THERAPIST'`.
  2.  **If type is 'FAMILY':**
      - Generate code stored with `type_verbinding = 'FAMILY'`.
- **Response:** `{ "code": "82941", "type": "THERAPIST", "expires_in": "15m" }`

---

### B. Linking (Receiver Side - Doctor or Family)

**User Story:** As a user (Doctor or Family), I simply enter the code I was given to connect.

- **Endpoint:** `POST /api/pairing/link`
- **Role:** Authenticated User (Therapist or any user).
- **Payload:** `{ "code": "82941" }`
- **Backend Logic:**
  1.  **Find Code:** Look up "82941" in `PairingCode` table.
  2.  **Check Validity:** Is it expired?
  3.  **Read Type:** Retrieve `type_verbinding` from the code record (e.g., 'THERAPIST').
  4.  **Assign Permissions:**
      - If Code Type is **'THERAPIST'** → Set `toegangsniveau` = `'FULL_ACCESS'`.
      - If Code Type is **'FAMILY'** → Set `toegangsniveau` = `'READ_ONLY'`.
  5.  **Set Status:** Set `status` = `'active'` (since the patient provided the code, consent is implied).
  6.  **Save:** Create record in `GebruikerKoppelingen` and delete the temporary code.
- **Result:** Connection established immediately.

---

### C. Unlinking (Revoking Access)

- **Endpoint:** `DELETE /api/pairing/unlink/{connection_id}`
- Allows Patient to remove Doctor/Family, or Doctor/Family to leave.

---

## 4. Security & Rules Summary

| Scenario                                                       | Action              | Outcome                                               |
| :------------------------------------------------------------- | :------------------ | :---------------------------------------------------- |
| **Patient has a Doctor -> Tries to generate 'Therapist Code'** | `/api/pairing/code` | ❌ **Error:** "Unlink current doctor first."          |
| **Patient generates 'Family Code' -> Doctor uses it**          | `/api/pairing/link` | ✅ **Success:** Linked as 'FAMILY' (Read-Only).       |
| **Patient generates 'Therapist Code' -> Family uses it**       | `/api/pairing/link` | ✅ **Success:** Linked as 'THERAPIST' (Write Access). |
