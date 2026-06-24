USE voting_system;

-- Password is 'password123' hashed with bcrypt (10 rounds)

-- Admin
INSERT INTO admins (name, email, password) VALUES
('Admin User', 'admin@college.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Faculty
INSERT INTO faculty (name, email, password, department) VALUES
('Dr. Sharma', 'sharma@college.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Computer Science'),
('Dr. Patel', 'patel@college.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Computer Science'),
('Dr. Gupta', 'gupta@college.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Information Technology'),
('Dr. Singh', 'singh@college.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Data Science'),
('Dr. Kumar', 'kumar@college.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mathematics');

-- Students
INSERT INTO students (name, email, password, department) VALUES
('Rahul Verma', 'rahul@student.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Computer Science'),
('Priya Nair', 'priya@student.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Computer Science'),
('Amit Das', 'amit@student.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Information Technology'),
('Sneha Roy', 'sneha@student.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Data Science'),
('Vikram Joshi', 'vikram@student.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Computer Science');

-- Subjects
INSERT INTO subjects (code, name, credits, max_seats, remaining_seats, schedule_info) VALUES
('CS101', 'Intro to Computer Science', 3, 3, 3, 'Mon/Wed 10:00 AM'),
('CS102', 'Data Structures', 4, 2, 2, 'Tue/Thu 2:00 PM'),
('MATH101', 'Calculus I', 4, 30, 30, 'Mon/Wed 1:00 PM'),
('PHY101', 'Physics I', 3, 20, 20, 'Fri 9:00 AM');

-- Sample Polls (expires 5 days from now)
INSERT INTO polls (prompt, created_by, expires_at) VALUES
('Choose the best faculty for DBMS', 1, DATE_ADD(NOW(), INTERVAL 5 DAY)),
('Choose the best faculty for Artificial Intelligence', 1, DATE_ADD(NOW(), INTERVAL 5 DAY));

-- Poll 1 options (DBMS)
INSERT INTO poll_options (poll_id, faculty_id) VALUES
(1, 1), -- Dr. Sharma
(1, 2), -- Dr. Patel
(1, 3); -- Dr. Gupta

-- Poll 2 options (AI)
INSERT INTO poll_options (poll_id, faculty_id) VALUES
(2, 1), -- Dr. Sharma
(2, 4), -- Dr. Singh
(2, 5); -- Dr. Kumar

-- Sample votes
INSERT INTO votes (student_id, poll_id, option_id) VALUES
(1, 1, 1),  -- Rahul votes Dr. Sharma for DBMS
(2, 1, 1),  -- Priya votes Dr. Sharma for DBMS
(3, 1, 2),  -- Amit votes Dr. Patel for DBMS
(4, 1, 3);  -- Sneha votes Dr. Gupta for DBMS

