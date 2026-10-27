USE camsdb;

-- Update existing programmes
UPDATE programmes SET 
    code = 'BTECH_CSE', 
    name = 'B.Tech Computer Science and Engineering', 
    department = 'CSE', 
    duration_years = 4, 
    intake_capacity = 60, 
    is_active = 1,
    merit_formula = '{"boardWeight":0.4,"entranceWeight":0.6,"tieBreaker":"ENTRANCE_FIRST"}',
    tuition_fee = 85000.0,
    other_fee = 15000.0
WHERE id = 1;

UPDATE programmes SET 
    code = 'BTECH_IT', 
    name = 'B.Tech Information Technology', 
    department = 'IT', 
    duration_years = 4, 
    intake_capacity = 60, 
    is_active = 1,
    merit_formula = '{"boardWeight":0.4,"entranceWeight":0.6,"tieBreaker":"ENTRANCE_FIRST"}',
    tuition_fee = 80000.0,
    other_fee = 15000.0
WHERE id = 2;

-- Insert remaining 5 undergraduate programmes
INSERT INTO programmes (id, code, name, department, intake_capacity, duration_years, is_active, merit_formula, tuition_fee, other_fee)
VALUES 
(3, 'BTECH_AIDS', 'B.Tech Artificial Intelligence and Data Science', 'AIDS', 60, 4, 1, '{"boardWeight":0.4,"entranceWeight":0.6,"tieBreaker":"ENTRANCE_FIRST"}', 85000.0, 15000.0)
ON DUPLICATE KEY UPDATE code = VALUES(code), name = VALUES(name), department = VALUES(department), intake_capacity = VALUES(intake_capacity), duration_years = VALUES(duration_years), is_active = VALUES(is_active), merit_formula = VALUES(merit_formula), tuition_fee = VALUES(tuition_fee), other_fee = VALUES(other_fee);

INSERT INTO programmes (id, code, name, department, intake_capacity, duration_years, is_active, merit_formula, tuition_fee, other_fee)
VALUES 
(4, 'BTECH_ECE', 'B.Tech Electronics and Communication Engineering', 'ECE', 60, 4, 1, '{"boardWeight":0.5,"entranceWeight":0.5,"tieBreaker":"MATHS_FIRST"}', 75000.0, 15000.0)
ON DUPLICATE KEY UPDATE code = VALUES(code), name = VALUES(name), department = VALUES(department), intake_capacity = VALUES(intake_capacity), duration_years = VALUES(duration_years), is_active = VALUES(is_active), merit_formula = VALUES(merit_formula), tuition_fee = VALUES(tuition_fee), other_fee = VALUES(other_fee);

INSERT INTO programmes (id, code, name, department, intake_capacity, duration_years, is_active, merit_formula, tuition_fee, other_fee)
VALUES 
(5, 'BTECH_EEE', 'B.Tech Electrical and Electronics Engineering', 'EEE', 60, 4, 1, '{"boardWeight":0.5,"entranceWeight":0.5,"tieBreaker":"BOARD_FIRST"}', 70000.0, 15000.0)
ON DUPLICATE KEY UPDATE code = VALUES(code), name = VALUES(name), department = VALUES(department), intake_capacity = VALUES(intake_capacity), duration_years = VALUES(duration_years), is_active = VALUES(is_active), merit_formula = VALUES(merit_formula), tuition_fee = VALUES(tuition_fee), other_fee = VALUES(other_fee);

INSERT INTO programmes (id, code, name, department, intake_capacity, duration_years, is_active, merit_formula, tuition_fee, other_fee)
VALUES 
(6, 'BTECH_MECH', 'B.Tech Mechanical Engineering', 'MECH', 60, 4, 1, '{"boardWeight":0.5,"entranceWeight":0.5,"tieBreaker":"BOARD_FIRST"}', 70000.0, 15000.0)
ON DUPLICATE KEY UPDATE code = VALUES(code), name = VALUES(name), department = VALUES(department), intake_capacity = VALUES(intake_capacity), duration_years = VALUES(duration_years), is_active = VALUES(is_active), merit_formula = VALUES(merit_formula), tuition_fee = VALUES(tuition_fee), other_fee = VALUES(other_fee);

INSERT INTO programmes (id, code, name, department, intake_capacity, duration_years, is_active, merit_formula, tuition_fee, other_fee)
VALUES 
(7, 'BTECH_CIVIL', 'B.Tech Civil Engineering', 'CIVIL', 60, 4, 1, '{"boardWeight":0.5,"entranceWeight":0.5,"tieBreaker":"BOARD_FIRST"}', 65000.0, 15000.0)
ON DUPLICATE KEY UPDATE code = VALUES(code), name = VALUES(name), department = VALUES(department), intake_capacity = VALUES(intake_capacity), duration_years = VALUES(duration_years), is_active = VALUES(is_active), merit_formula = VALUES(merit_formula), tuition_fee = VALUES(tuition_fee), other_fee = VALUES(other_fee);

-- Ensure seat matrices for all 7 programmes exist
INSERT IGNORE INTO seat_matrix (programme_id, quota, allotted, total_seats, round_no, academic_year)
SELECT p.id, 'GEN', 0, 24, 1, '2026-27' FROM programmes p WHERE p.is_active = 1;
INSERT IGNORE INTO seat_matrix (programme_id, quota, allotted, total_seats, round_no, academic_year)
SELECT p.id, 'OBC', 0, 16, 1, '2026-27' FROM programmes p WHERE p.is_active = 1;
INSERT IGNORE INTO seat_matrix (programme_id, quota, allotted, total_seats, round_no, academic_year)
SELECT p.id, 'SC', 0, 9, 1, '2026-27' FROM programmes p WHERE p.is_active = 1;
INSERT IGNORE INTO seat_matrix (programme_id, quota, allotted, total_seats, round_no, academic_year)
SELECT p.id, 'ST', 0, 5, 1, '2026-27' FROM programmes p WHERE p.is_active = 1;
INSERT IGNORE INTO seat_matrix (programme_id, quota, allotted, total_seats, round_no, academic_year)
SELECT p.id, 'EWS', 0, 6, 1, '2026-27' FROM programmes p WHERE p.is_active = 1;

-- Clean up any old August/June test dates in fee_payments
UPDATE fee_payments SET paid_at = '2026-09-05 10:30:00' WHERE paid_at < '2026-09-01';

-- Ensure demo applicant (applicant id 5, user 6 applicant@cams.edu) has valid applications and allotment for fee testing
DELETE FROM applications WHERE applicant_id = 5;

INSERT INTO applications (applied_date, preference_rank, status, applicant_id, programme_id, academic_year, acceptance_deadline, allotted_quota, allotted_round, application_number, merit_score, upgrade_requested)
VALUES 
('2026-09-02 10:00:00', 1, 'ALLOTTED', 5, 1, '2026-27', '2026-10-18 23:59:59', 'GEN', 1, 'CAMS-2026-000501', 92.5, 0),
('2026-09-02 10:00:00', 2, 'SUBMITTED', 5, 2, '2026-27', NULL, NULL, NULL, 'CAMS-2026-000502', 92.5, 0),
('2026-09-02 10:00:00', 3, 'SUBMITTED', 5, 3, '2026-27', NULL, NULL, NULL, 'CAMS-2026-000503', 92.5, 0),
('2026-09-02 10:00:00', 4, 'SUBMITTED', 5, 4, '2026-27', NULL, NULL, NULL, 'CAMS-2026-000504', 92.5, 0),
('2026-09-02 10:00:00', 5, 'SUBMITTED', 5, 5, '2026-27', NULL, NULL, NULL, 'CAMS-2026-000505', 92.5, 0);

-- Also ensure applicant 6 (kavyasekar46@gmail.com) has all 5 preferences in submitted status
DELETE FROM applications WHERE applicant_id = 6;
INSERT INTO applications (applied_date, preference_rank, status, applicant_id, programme_id, academic_year, application_number, merit_score, upgrade_requested)
VALUES 
('2026-09-10 04:44:00', 1, 'SUBMITTED', 6, 1, '2026-27', 'CAMS-2026-000601', 94.0, 0),
('2026-09-10 04:44:00', 2, 'SUBMITTED', 6, 2, '2026-27', 'CAMS-2026-000602', 94.0, 0),
('2026-09-10 04:44:00', 3, 'SUBMITTED', 6, 3, '2026-27', 'CAMS-2026-000603', 94.0, 0),
('2026-09-10 04:44:00', 4, 'SUBMITTED', 6, 4, '2026-27', 'CAMS-2026-000604', 94.0, 0),
('2026-09-10 04:44:00', 5, 'SUBMITTED', 6, 5, '2026-27', 'CAMS-2026-000605', 94.0, 0);
