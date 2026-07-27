-- =================================== ===
-- DATABASE INIT: /src/config/init.sql ===
-- =================================== ===

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. TABLE BANTU: positions (Master Data Jabatan/Role Staf)
CREATE TABLE IF NOT EXISTS positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Admin, Front Office, Housekeeping, Maintenance
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE: employees (Data Pegawai Hotel)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT NOT NULL, -- FK ke positions
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint Foreign Key
    CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT,

    -- Indexing
    INDEX idx_employee_name (name),
    INDEX idx_employee_position (position_id)
);

-- 3. TABLE: users (Akun Login Pegawai)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE, -- FK ke employees (One-to-One / 1 Akun 1 Pegawai)
    username VARCHAR(50) NOT NULL UNIQUE, -- login
    password VARCHAR(255) NOT NULL, -- HASH | login
    is_active BOOLEAN DEFAULT TRUE, -- status akun
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint Foreign Key
    CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,

    -- Indexing
    INDEX idx_username (username)
);

-- 4. TABLE BANTU: room_types (Master Data Tipe Kamar)
CREATE TABLE IF NOT EXISTS room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Standard, Deluxe, Suite
    base_price DECIMAL(10, 2) NOT NULL, -- harga acuan
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE: rooms (Data Kamar Hotel)
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL, -- FK ke room_types
    room_number VARCHAR(10) NOT NULL UNIQUE, -- formatnya belum pasti
    price_per_night DECIMAL(10, 2) NOT NULL, -- harga permalam
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') DEFAULT 'AVAILABLE', -- status room

    -- Constraint Foreign Key
    CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,

    -- Indexing
    INDEX idx_room_number (room_number),
    INDEX idx_status (status)
);

-- 6. TABLE: guests (Data Tamu Hotel)
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identity_number VARCHAR(50) NOT NULL UNIQUE, -- KTP / Paspor
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexing
    INDEX idx_identity_number (identity_number),
    INDEX idx_guest_name (name)
);

-- 7. TABLE: reservations (Data Transaksi Reservasi)
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL, -- FK
    room_id INT NOT NULL, -- FK 
    user_id INT NOT NULL, -- FK user/petugas FRONT OFFICE yang layanin
    check_in_date DATETIME NOT NULL, -- diubah ke DATETIME agar spesifik dengan jam check-in
    check_out_date DATETIME NOT NULL, -- diubah ke DATETIME agar spesifik dengan jam check-out
    status ENUM('BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraint Foreign Keys
    CONSTRAINT fk_reservations_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    -- Indexing
    INDEX idx_checkin_checkout (check_in_date, check_out_date),
    INDEX idx_reservation_status (status)
);

-- 8. TABLE BANTU: maintenance_categories (Kategori Perbaikan)
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Plumbing, AC/HVAC, Electrical, Furniture, Painting
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLE: room_maintenances (Data & Riwayat Maintenance Kamar)
CREATE TABLE IF NOT EXISTS room_maintenances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL, -- FK ke kamar yang diperbaiki
    category_id INT NOT NULL, -- FK ke jenis kerusakannya
    reported_by_user_id INT NOT NULL, -- FK user/staf yang melaporkan
    handled_by_employee_id INT, -- FK ke pegawai/teknisi yang mengerjakan (bisa NULL di awal)
    title VARCHAR(150) NOT NULL, -- judul/ringkasan masalah
    description TEXT, -- detail kerusakannya
    cost DECIMAL(10, 2) DEFAULT 0.00, -- biaya perbaikan
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'IN_PROGRESS',
    start_date DATETIME NOT NULL,
    end_date DATETIME, -- diisi jika sudah selesai
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraint Foreign Keys
    CONSTRAINT fk_maintenances_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_maintenances_category FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_maintenances_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_maintenances_technician FOREIGN KEY (handled_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL,

    -- Indexing
    INDEX idx_maintenance_room (room_id),
    INDEX idx_maintenance_status (status),
    INDEX idx_maintenance_dates (start_date, end_date)
);