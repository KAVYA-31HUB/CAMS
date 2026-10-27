# College Admission Management System — Backend

Spring Boot 3 + Spring Data JPA + H2 (in-memory). No security/JWT — kept out on purpose
for the review build. Covers: Applicant & Programme management, Application submission,
Merit list generation, Seat allocation, Fee payment.

## How to run (MySQL)

1. Make sure MySQL server is running locally.
2. Open `src/main/resources/application.properties` and set your real MySQL
   `spring.datasource.username` / `spring.datasource.password`.
   - You do **not** need to manually create the `camsdb` database — the connection URL has
     `createDatabaseIfNotExist=true`, so MySQL creates it on first connect.
   - Hibernate then creates all the tables itself (`spring.jpa.hibernate.ddl-auto=update`) —
     you don't need to write any CREATE TABLE statements.
3. Import as a Maven project in IntelliJ / Eclipse / VS Code (or `cd cams && mvn spring-boot:run`).
4. It starts on `http://localhost:8080`. Check your MySQL client — you should see `camsdb`
   with tables `applicants`, `programmes`, `applications`, `seat_matrix`, `fee_payments`.

## Architecture (for the viva)

```
Controller  -> handles HTTP, calls Service, returns ResponseEntity
Service     -> business logic (validation rules, merit calculation, allocation algorithm)
Repository  -> Spring Data JPA interfaces, no manual SQL
Entity      -> JPA @Entity classes mapped to tables
Exception   -> custom exceptions + one @RestControllerAdvice (GlobalExceptionHandler)
              that converts every exception into a clean JSON error response
```

Each layer only talks to the one below it (Controller never touches Repository directly)
— that's the "layered architecture" line from the SRS (section 3.6.4).

## Entities & relationships

- `Applicant` — name, email, phone, category, boardPercentage, entranceScore
- `Programme` — name, department, intakeCapacity, durationYears, isActive
- `AdmissionApplication` — links one Applicant to one Programme (`@ManyToOne` x2), preferenceRank, status
- `SeatMatrix` — seats available for a Programme + quota + round + academic year
- `FeePayment` — payment made by an Applicant

## Business logic worth explaining in the viva

- **Merit score** (`ApplicationService.combinedScore`): `boardPercentage*0.4 + entranceScore*0.6`.
  In the full SRS this formula is meant to live in `Programme.merit_formula` as JSON so it's
  configurable per programme without a code change — here it's a fixed weight for simplicity,
  say that out loud if asked.
- **Seat allocation** (`SeatAllocationService.allocateSeats`): takes a `SeatMatrix` row
  (one programme + one quota + one round), pulls the merit list for that quota, and fills
  seats top-down until the row's `totalSeats` is reached. Anyone left over is effectively
  waitlisted (their status stays `SUBMITTED`/`VERIFIED`).
- **Duplicate prevention** (`DuplicateApplicationException`): an applicant can't submit two
  applications to the same programme — checked before insert.
- **Custom exceptions**: `ResourceNotFoundException` (404), `DuplicateApplicationException` (409),
  `SeatConflictException` (409), `InvalidNameException`/`InvalidPhoneException` (400) — all
  caught centrally in `GlobalExceptionHandler` so controllers stay clean.

## API endpoints to demo (Postman)

### Applicants
- `POST /api/applicants` — body: `{"name":"Arjun Kumar","email":"arjun@test.com","phone":"9876543210","category":"GEN","boardPercentage":92.5,"entranceScore":88.0}`
- `GET /api/applicants`
- `GET /api/applicants/{id}`
- `PUT /api/applicants/{id}`
- `DELETE /api/applicants/{id}`

### Programmes
- `POST /api/programmes` — body: `{"name":"B.Tech CSE","department":"CSE","intakeCapacity":60,"durationYears":4,"isActive":true}`
- `GET /api/programmes`
- `GET /api/programmes/{id}`

### Applications
- `POST /api/applications?applicantId=1&programmeId=1&preferenceRank=1`
- `GET /api/applications`
- `GET /api/applications/merit-list/{programmeId}` — sorted merit list
- `GET /api/applications/merit-list/{programmeId}?category=GEN` — category-wise
- `PUT /api/applications/{id}/status?status=VERIFIED`

### Seat Matrix
- `POST /api/seat-matrix?programmeId=1&quota=GEN&totalSeats=2&roundNo=1&academicYear=2026-27`
- `GET /api/seat-matrix`

### Allocation
- `POST /api/allocation/run/{seatMatrixId}` — allots seats to top applicants of that quota

### Fees
- `POST /api/fees/initiate?applicantId=1&amount=50000&mode=UPI`
- `GET /api/fees`

## Suggested demo flow for tomorrow

1. Create 2-3 `Applicant`s with different `boardPercentage`/`entranceScore`.
2. Create 1 `Programme`.
3. Submit `Application`s for each applicant to that programme (same category, e.g. `GEN`).
4. Hit `GET /api/applications/merit-list/{programmeId}` → show ranking works.
5. Create a `SeatMatrix` row with `totalSeats=1` for that programme+quota.
6. Hit `POST /api/allocation/run/{seatMatrixId}` → only the top applicant gets `ALLOTTED`.
7. Trigger a validation error (bad phone number) and a duplicate application → show
   `GlobalExceptionHandler` returning clean JSON instead of a stack trace.
8. Initiate a fee payment for the allotted applicant.

## Not included (by design, for this review build)

- Spring Security / JWT / login — explicitly left out
- DigiLocker, real payment gateway, SMS/email — external integrations, simulated/stubbed
- Waitlist auto-promotion job, analytics/reporting endpoints — future scope per SRS Appendix G
