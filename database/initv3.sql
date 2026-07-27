-- ====================
-- DATABASE HOTEL   ===
-- ====================

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. TABLE BANTU: positions (Master Data Jabatan/Role Pegawai)
CREATE TABLE IF NOT EXISTS positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Admin, Front Office, Housekeeping, Maintenance
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE: employees (Data Pegawai Hotel)
CREATE TABLE IF NOT EXISTS  employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT,

    INDEX idx_employee_name (name),
    INDEX idx_employee_position (position_id)
);

-- 3. TABLE: users (Akun Login Pegawai)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE, -- One-to-One dengan employees
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed password (bcrypt)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_username (username)
);

-- 4. TABLE BANTU: room_types (Master Data Tipe Kamar)
CREATE TABLE room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Standard, Deluxe, Suite
    base_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE: rooms (Data Kamar Hotel + Status Kebersihan Housekeeping)
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    price_per_night DECIMAL(10, 2) NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    clean_status ENUM('CLEAN', 'IN_PROGRESS', 'DIRTY') DEFAULT 'CLEAN',
    CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
    INDEX idx_room_number (room_number),
    INDEX idx_status (status),
    INDEX idx_clean_status (clean_status)
);

-- 6. TABLE BANTU: amenities (Master Data Fasilitas Kamar)
CREATE TABLE amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Contoh: AC, Wi-Fi, Smart TV, Water Heater, Mini Bar
    icon VARCHAR(100), -- Opsional untuk nama class icon (misal: FontAwesome)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE PIVOT: room_amenities (Relasi Many-to-Many Kamar & Fasilitas)
CREATE TABLE room_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL, -- FK ke rooms
    amenity_id INT NOT NULL, -- FK ke amenities
    CONSTRAINT fk_room_amenities_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_amenities_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    UNIQUE KEY uk_room_amenity (room_id, amenity_id)
);

-- 8. TABLE: guests (Data Tamu Hotel)
CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identity_number VARCHAR(50) NOT NULL UNIQUE, -- KTP / Paspor
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identity_number (identity_number),
    INDEX idx_guest_name (name)
);

-- 9. TABLE: reservations (Data Transaksi Reservasi & Check-In/Out)
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    user_id INT NOT NULL, -- Petugas Front Office yang melayani
    check_in_date DATETIME NOT NULL,
    check_out_date DATETIME NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('UNPAID', 'DOWN_PAYMENT', 'PAID') DEFAULT 'UNPAID',
    status ENUM('BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_checkin_checkout (check_in_date, check_out_date),
    INDEX idx_reservation_status (status)
);

-- 10. TABLE BANTU: maintenance_categories (Kategori Kerusakan)
CREATE TABLE maintenance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Plumbing, AC, Electrical, Furniture
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABLE: room_maintenances (Data & Riwayat Maintenance Kamar)
CREATE TABLE room_maintenances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    category_id INT NOT NULL,
    reported_by_user_id INT NOT NULL,
    handled_by_employee_id INT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'IN_PROGRESS',
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenances_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_maintenances_category FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_maintenances_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_maintenances_technician FOREIGN KEY (handled_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_maintenance_room (room_id),
    INDEX idx_maintenance_status (status)
);


--- Salah Salah Salah! Housekeeping ternyata... bukan Engineering gak ada maintenance!
-- harus diubah lagi TAT