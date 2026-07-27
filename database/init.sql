-- =================================== ===
-- DATABASE INIT: /src/config/init.sql ===
-- =================================== ===

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. TABLE: users (Front Office Staff & Admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, -- login
    password VARCHAR(255) NOT NULL, -- HASH | login
    name VARCHAR(100) NOT NULL, 
    role ENUM('ADMIN', 'STAFF') DEFAULT 'STAFF', -- Jabatan, bisa buat set privilegesnya
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP > DATETIME untuk waktu singkron
    INDEX idx_username (username) -- index untuk login
);

-- 2. TABLE: rooms (Data Kamar Hotel)
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE, -- formatnya belum pasti
    room_type VARCHAR(50) NOT NULL, -- bisa pakai enum tapi belum tau
    price_per_night DECIMAL(10, 2) NOT NULL, -- harga permalam
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') DEFAULT 'AVAILABLE', -- status room
    INDEX idx_room_number (room_number), -- buat search
    INDEX idx_status (status) -- buat search
);

-- 3. TABLE: guests (Data Tamu Hotel)
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identity_number VARCHAR(50) NOT NULL UNIQUE, -- KTP / Paspor
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP biar waktunya gak kekunci waktu lokal
    INDEX idx_identity_number (identity_number), -- buat search
    INDEX idx_guest_name (name) -- buat search
);

-- 4. TABLE: reservations (Data Transaksi Reservasi)
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL, -- FK
    room_id INT NOT NULL, -- FK 
    user_id INT NOT NULL, -- STAFF atau petugas FRONT OFFICE yang layanin
    check_in_date DATE NOT NULL, -- masih belum yakin DATE atau TIMESTAMP atau DATETIME
    check_out_date DATE NOT NULL, -- masih belum yakin DATE atau TIMESTAMP atau DATETIME
    status ENUM('BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') DEFAULT 'BOOKED', -- buat status reservasinya
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraint Foreign Keys dengan RESTRICT (induk/table references tidak bisa dihapus jika di sini masih kepake)
    CONSTRAINT fk_reservations_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    -- Indexing untuk search (biar gak lama loading pas data banyak)
    INDEX idx_checkin_checkout (check_in_date, check_out_date),
    INDEX idx_reservation_status (status)
);