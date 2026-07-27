-- ============== ===
-- DATABASE HOTEL ===
-- ============== ===

-- SUDAH DIURUT UNTUK RUN PENUH TANPA ERROR

-- DATABASE: boleh ganti namanya.
-- note: hapus atau comment jika sudah dalam database
CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. MASTER TABLE: positions (Jabatan Pegawai)
CREATE TABLE IF NOT EXISTS positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Admin, Front Office, Housekeeping
    description TEXT, -- ... 

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu Data(ROW) Ditambahkan
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- log update
);

-- 2. TABLE: employees (Data Pegawai Hotel)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE, -- NIP 
    name VARCHAR(100) NOT NULL, -- Nama Lengkap
    phone VARCHAR(20) NOT NULL, -- Nomor Telepon
    email VARCHAR(100), -- Email
    position_id INT NOT NULL, -- Jabatan
    status ENUM('active', 'inactive', 'resigned') DEFAULT 'active', -- Status pegawai, jika resigned maka akunnya tidak bisa dipakai (block)s
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu Data ditambahkan
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- log update

    CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT, -- dikunci 

    INDEX idx_employee_name (name) -- Wajib tambah INDEX manual karena nama bisa sama (Non-Unique)
);

-- 3. TABLE: users (Akun Pegawai / Login Sistem)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE, -- Pegawai, 1 Karyawan = 1 Akun
    username VARCHAR(50) NOT NULL UNIQUE, -- (Otomatis memiliki INDEX karena UNIQUE)
    password VARCHAR(255) NOT NULL, -- Hashed dengan bcrypt
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- log update

    CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT
);

-- 4. MASYER TABLE: room_types (Tipe Kamar atau Kelas Kamar)
CREATE TABLE IF NOT EXISTS room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Standard, Deluxe, Suite . table sendiri dibanding ENUM karna bisa berubah
    base_price DECIMAL(10, 2) NOT NULL, -- Harga dasar per malam tersentralisasi di sini!
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu data ditambah
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- log update
);

-- 5. TABLE: rooms (Data Fisik Kamar Hotel + Status)
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL UNIQUE, -- S123 D223 ST001 whtvr
    extension_phone VARCHAR(10) NULL UNIQUE, -- nomor telepon kamar
    status ENUM('available', 'maintenance') DEFAULT 'available', -- kondisi fisik, reserved dan occupied bisa dari logic di 
    clean_status ENUM('clean', 'dirty') DEFAULT 'clean', -- team HouseKeeping mengupdate status

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu data ditambah
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- log update

    CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT, -- dikunci master gak boleh hapus kalo masih dipake

    INDEX idx_room_number (room_number),
    INDEX idx_status (status),
    INDEX idx_clean_status (clean_status)
);

-- 6. TABLE: guests (Data Identitas Tamu Hotel)
-- CREATE TABLE IF NOT EXISTS guests (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     identity_number VARCHAR(50) NOT NULL UNIQUE, -- Nomor KTP / Paspor, Haruskah tambah ENUM atau passport beda digit bisa diakali di frontend? atau tambah column untuk foreigner or not
--     phone VARCHAR(20) NOT NULL, 
--     email VARCHAR(100),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu Data(ROW) Ditambah
--     INDEX idx_identity_number (identity_number),
--     INDEX idx_guest_name (name)
-- );
-- Baru, versi yang AMAN (SeCuRE)
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),

    -- Note: karna search harus hash dulu, jadi tidak bisa langsung otomatis ketemu sudah ada di data tamu seperti di simulasi sebelumnya
    identity_id_encrypted VARCHAR(255) NOT NULL, -- Disimpan dalam bentuk Enkripsi AES-256 (MASALAH: TIDAK BISA DI-SEARCH LANGSUNG)
    identity_id_masked VARCHAR(20) NOT NULL, -- Disimpan dalam bentuk Masking "3275-XXXX-XXXX-9012" (AMAN UNTUK TAMPILAN FRONTEND)
    identity_id_blind_index VARCHAR(64) UNIQUE, -- Disimpan dalam bentuk Hash SHA-256 statis untuk fitur Search (BISMILLAH BISA)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu data ditambah
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- log update

    INDEX idx_identity_id_blind (identity_id_blind_index)
);

-- 7. TABLE: reservations (Transaksi Utama Reservasi & Check-In/Out) (BOSS LEVEL A)
-- Menyimpan informasi siapa yang memesan, siapa pegawai yang melayani, dan status globalnya.
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_code VARCHAR(30) NOT NULL UNIQUE, -- Contoh: RES-20260726-001
    guest_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'canceled') DEFAULT 'pending',
    total_guest INT DEFAULT 1, -- jumlah customer atau tamu
    total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
-- 8. PIVOT TABLE: reservations + rooms (bisa berubah jadi reservations_detail jika bukan hanya untuk room misalnya fasilitas lain)
-- Menghubungkan satu reservation_code ke BANYAK room_id (Kamar yang dipesan)
CREATE TABLE IF NOT EXISTS reservation_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    room_id INT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL, -- Harga kamar saat dipesan (double data dengan room_type tapi ini baik untuk arsip historis)

    -- rencana
    check_in DATE NOT NULL, -- ditentukan saat booking
    check_out DATE NOT NULL, -- ditentukan saat booking

    status ENUM('booked', 'checked_in', 'checked_out', 'canceled') DEFAULT 'booked', -- split check-in check-out 

    -- yang terjadi
    checked_in_at TIMESTAMP NULL, -- dimasukan saat checkin
    check_in_by INT NULL, -- pegawai atau FrontOffice staff atau Receptionist yang bertugas

    checked_out_at TIMESTAMP NULL, -- dimasukan saat checkout
    check_out_by INT NULL, -- pegawai atau FrontOffice staff atau Receptionist yang bertugas

    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE, -- akan terhapus jika reservation dihapus
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT, -- dikunci
    CONSTRAINT fk_res_rooms_checked_in_by FOREIGN KEY (check_in_by) REFERENCES users(id) ON DELETE SET NULL, -- jadi Null kalo user terkait dihapus
    CONSTRAINT fk_res_rooms_checked_out_by FOREIGN KEY (check_out_by) REFERENCES users(id) ON DELETE SET NULL, -- jadi Null kalo user terkait dihapus

    CONSTRAINT unique_reservation_room UNIQUE (reservation_id, room_id), -- mencegah duplikasi data
    CONSTRAINT chk_dates CHECK (check_out > check_in), -- mencegah kesalahan data

    INDEX idx_room_availability (room_id, status, check_in, check_out) -- untuk check kersedian kamar agar tidak conflict
);

-- 9. TABLE: payments (Pembayaran yang masuk) (Satu reservasi bisa punya pembayaran berkali", DP dan Pelunasan misalnya) // Is this a good idea?
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, 
    payment_method ENUM('cash', 'debit_card', 'credit_card', 'transfer', 'qris') NOT NULL, -- Enum atau table master aja ya? ENUM dulu 
    payment_type ENUM('down_payment', 'settlement', 'refund') NOT NULL,
    reference_number VARCHAR(100), -- nomor referensi transaksi pembayaran melalui transfer atau semacamnya
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT, -- dikunci
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT, -- dikunci

    INDEX idx_reservation_payment (reservation_id)
);

-- 10. TABLE: cleaning_logs (Riwayat Pembersihan Kamar oleh Housekeeping) // tambahan untuk kelompok B, entah cocok atau tidak.
CREATE TABLE IF NOT EXISTS cleaning_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL, -- Ruangan yang dibersihkan
    employee_id INT NOT NULL, -- Petugas Housekeeping yang bertugas
    action_note TEXT,         -- Catatan kecil (misal: "Ganti seprei, isi ulang sabun, lalala..")
    cleaned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Waktu selesai dibersihkan

    CONSTRAINT fk_cleaning_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cleaning_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,

    INDEX idx_cleaning_room (room_id),
    INDEX idx_cleaning_date (cleaned_at)
);


-- Payments? siapa yang kepikiran payment. 
-- Perlu Payments gak sih? perlu lah.
-- Tapi kan aplikasi sederhana? kan tetep perlu bayaran, masa hotel gratis.
-- Kan bisa manual aja. Tujuannya kan biar gak manual lagi.
-- Broo stop! You went too far

-- Untuk detail Kamar
-- 11. MASTER TABLE: Fasilitas / Amenities
CREATE TABLE IF NOT EXISTS amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Contoh: AC, Smart TV, WiFi, King Bed
    icon VARCHAR(50), -- Opsional: untuk ikon di React biar gak manual atau pake function switch (misal: 'wifi', 'tv')
    description TEXT
);

-- 12. PIVOT TABLE: antara room_types dan amenities (N:M)
CREATE TABLE IF NOT EXISTS room_type_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    amenity_id INT NOT NULL,

    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,

    CONSTRAINT unique_type_amenity UNIQUE (room_type_id, amenity_id) -- mencegah duplikasi
);

-- 13. MASTER TABLE: application berisi aplikasi kantor yang bisa digunakan pegawai (enterprise concept)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 14. PIVOT TABLE: antara application dan users 
CREATE TABLE IF NOT EXISTS application_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',

    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE, -- hilang jika aplikasi atau users terkait dihapus
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- hilang jika aplikasi atau users terkait dihapus

    CONSTRAINT unique_application_user UNIQUE(application_id, user_id)
);