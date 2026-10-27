# College Admission Management System (CAMS)

A complete, production-grade, full-stack **College Admission Management System (CAMS)** built according to statutory higher education admission guidelines and the Software Requirements Specification (SRS).

---

## 🏛️ System Architecture

- **Backend**: Spring Boot 3.2.5 + Java 17 + Spring Security 6 (Stateless JWT) + Spring Data JPA + MySQL 8.0 (`camsdb`)
- **Frontend**: React 18 + Vite 8 + React Router DOM v6 + Axios + Lucide Icons + Vitest + React Testing Library
- **Portals & Roles**:
  1. **Public**: Course catalogue, dynamic prospectus, application tracking timeline.
  2. **Applicant**: Multi-step application with auto-save & resume, DigiLocker document import, SHA-256 integrity hashing, live allotment tracking, fee payments, and GST tax invoice receipts.
  3. **Counsellor**: Document audit desk, cryptographic checksum inspection, approve/discrepancy workflow with mandatory remarks.
  4. **Coordinator**: Dynamic JSON merit ranking engine, round-based seat allocation with pessimistic `SELECT FOR UPDATE` locks, and waitlist upgrade supervision.
  5. **Registrar**: Admissions conversion funnel, AISHE statutory survey CSV export, and UGC compliance reports.
  6. **Finance**: Institutional fee collection ledger, GST (HSN 999293) invoice generation, and scholarship concessions.
  7. **Admin**: User lifecycle management, programme CRUD with JSON formula editor, seat matrix configurator, immutable audit trails, and live service boundary health monitoring.

---

## 🚀 Getting Started

### 1. Database Configuration
Ensure MySQL is running on `localhost:3306` with database `camsdb`.
Configure credentials in `cams/src/main/resources/application.properties` (defaults: `root` / `Kavya@31`).

### 2. Run Backend Server
```bash
cd "d:\ad final\cams"
.\mvnw.cmd spring-boot:run
```
Backend runs on **`http://localhost:8080`**.

### 3. Run Frontend Server
```bash
cd "d:\ad final\frontend"
npm run dev
```
Frontend runs on **`http://localhost:5173`**.

---

## 🔑 Pre-seeded Demo Accounts

All pre-seeded demo accounts share the password: **`Admin@1234`**

| Role | Email / Username | Permissions & Scope |
| :--- | :--- | :--- |
| **ADMIN** | `admin@cams.edu` | Full command center, formula configuration, user lifecycle |
| **REGISTRAR** | `registrar@cams.edu` | AISHE regulatory export, UGC compliance, intake audits |
| **COORDINATOR** | `coordinator@cams.edu` | Merit lists, seat matrix allocation, waitlist & upgrades |
| **COUNSELLOR** | `counsellor@cams.edu` | Transcripts & certificates verification, discrepancy flagging |
| **FINANCE** | `finance@cams.edu` | Fee collections, GST 999293 tax receipts, scholarships |
| **APPLICANT** | `applicant@cams.edu` | Applications, documents, seat allotments, fee remittance |

---

## 🧪 Test Suites

### Backend Unit & Integration Tests (16 Tests)
```bash
cd "d:\ad final\cams"
.\mvnw.cmd test
```
- `AuthServiceTest`: Role-based JWT issuance, validation, and session durations.
- `ApplicationServiceTest`: Dynamic JSON formula evaluation, multi-step application lifecycle.
- `MeritAllocationTest`: Pessimistic locking seat allocation, quota enforcement, waitlist upgrade.
- `FeeAndDocumentTest`: GST invoice calculations, SHA-256 checksums, DigiLocker verification.
- `ValidationTest`: Appendix C candidate validation constraints.

### Frontend Unit & Component Tests (12 Tests)
```bash
cd "d:\ad final\frontend"
npm test
```
- `StatusBadge.test.jsx`: Application and verification status mappings.
- `Login.test.jsx`: Authentication form, fast-fill demo role switchers.
- `RegisterValidation.test.jsx`: Form inputs, required fields, and validation states.

---

## 🛡️ Statutory & Architectural Highlights

1. **Transactional Seat Allocation**: Enforces `LockModeType.PESSIMISTIC_WRITE` (`SELECT FOR UPDATE`) on quota seat matrices to prevent race conditions and over-allocation.
2. **Dynamic JSON Merit Formulas**: Merit formulas configured per programme (e.g. `{"boardWeight": 0.4, "entranceWeight": 0.6}`) and evaluated server-side.
3. **GST Tax Compliance**: Invoices follow HSN 999293 with educational tuition exemption under Notification 12/2017.
4. **Regulatory Reporting**: Instant AISHE (SC/ST/OBC/EWS & gender parity) survey exports and UGC intake compliance tracking.
5. **DigiLocker & Integrity**: Document verification backed by SHA-256 cryptographic hashes and Government of India DigiLocker boundary integration.
