# 🏨 Reservasi Grand Nusantara Hotel - Backend

Backend API untuk aplikasi Reservasi Grand Nusantara Hotel yang dibangun menggunakan **Node.js**, **Express**, dan **MySQL**. Proyek ini dikembangkan oleh **Kelompok A** untuk kegiatan OJT. Selengkapnya dapat dilihat di [Wiki project kami](https://github.com/Sambal404/system-reservasi-hotel/wiki) untuk penjelasan lengkap detail proyek.

---

## 🛠️ Tech Stack & Dependencies

* **Runtime:** Node.js (CommonJS)
* **Framework:** Express
* **Database Driver:** mysql2
* **Authentication:** jsonwebtoken & bcrypt
* **Security & Utility:** cors, dotenv
* **Development Tool:** nodemon

---

## ⚙️ Environment Variables (.env)

Buat file bernama `.env` di root direktori backend Anda dengan merujuk pada contoh berikut:

```env
# APP CONFIG
NODE_ENV=development
APP_NAME="Front Office POS"
PORT=3000

# DATABASE
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_db

# AUTH
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRES_IN=9h

# CORS
FRONTEND_URL=http://localhost:5173

```

---

## 🚀 Cara Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan server backend di komputer lokal Anda:

### 1. Install Dependencies

Buka terminal di dalam folder backend, lalu jalankan perintah:

```bash
npm install

```

### 2. Konfigurasi Database

Pastikan Anda sudah menyiapkan database MySQL dengan nama `hotel_db` (sesuai struktur SQL yang ada pada folder database proyek ini) dan sesuaikan kredensial `DB_USER` serta `DB_PASSWORD` di file `.env`.

### 3. Menjalankan Server

* **Mode Development (dengan Nodemon - otomatis *restart* saat ada perubahan file):**
```bash
npm run dev

```


* **Mode Production / Standar:**
```bash
npm start

```



Server akan berjalan dan mendengarkan pada port yang telah ditentukan (default: `http://localhost:3000`).

---

## 📂 Struktur Direktori Proyek

```text
/
├── src/
│   ├── config/             # Konfigurasi database (db.js)
│   ├── controllers/        # Logika bisnis/endpoint
│   ├── middlewares/        # Autentikasi, role, & validasi request
│   ├── models/             # Query interaksi langsung ke database MySQL
│   ├── routes/             # Definisi rute/endpoint API
│   └── utils/              # Fungsi bantu (generate code, dll)
├── .env                    # Variabel lingkungan
├── server.js               # Entry point aplikasi Express
└── package.json            # Daftar dependencies proyek

```

---

## 🔌 Daftar Endpoint Utama (API Reference)

Base URL: `http://localhost:3000/api`

### 1. 🔐 Authentication (`/auth`)

| Method | Endpoint | Kegunaan | Butuh Auth? | Akses Role | Contoh Input / Keterangan |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | Login staff/admin & mendapatkan Token JWT | ❌ Tidak | Publik | `Body JSON`: `{ "username": "admin", "password": "123" }` |
| `GET` | `/auth/me` | Mengambil data profil user yang sedang login |✅ Ya | Admin / Staff | `Headers`: `Authorization: Bearer <token>` |
| `POST` | `/auth/logout` | Proses logout user | ✅ Ya | Admin / Staff | `Headers`: `Authorization: Bearer <token>` |

### 2. 📊 Dashboard (`/dashboard`)

| Method | Endpoint | Kegunaan | Butuh Auth? | Akses Role | Contoh Input / Keterangan |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/dashboard` | Mengambil ringkasan statistik (kamar, reservasi, tamu) | ✅ Ya | Admin / Staff | Mengambil data summary/statistik keseluruhan sistem. |
| `GET` | `/dashboard/stream` | Real-time stream (SSE) perubahan data dashboard | ✅ Ya | Admin / Staff | Server-Sent Events (SSE) untuk live update dashboard. |

### 3. 👥 Guests (`/guests`)

| Method | Endpoint | Kegunaan | Butuh Auth? | Akses Role | Contoh Input / Keterangan |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/guests` | Melihat daftar seluruh tamu (mendukung pencarian & pagination) | ✅ Ya | Admin / Staff | `Query Params`: `?search=budi&page=1&limit=10` |
| `GET` | `/guests/:id` | Mengambil detail profil tamu berdasarkan ID | ✅ Ya | Admin / Staff | `Params URL`: `/api/guests/1` |
| `POST` | `/guests` | Menambah data tamu baru ke dalam sistem | ✅ Ya | Admin / Staff | `Body JSON`: `{ "name": "Siti", "gender": "female", "identity_type": "KTP", "identity_number": "320...", "phone": "0812...", "email": "siti@mail.com" }` |
| `PUT` | `/guests/:id` | Memperbarui data tamu | ✅ Ya | Admin / Staff | `Body JSON`: Data profil tamu yang diperbarui. |
| `DELETE` | `/guests/:id` | Menghapus data tamu | ✅ Ya | Admin / Staff | `Params URL`: `/api/guests/1` |

### 4. 🛏️ Rooms (`/rooms`)

| Method | Endpoint | Kegunaan | Butuh Auth? | Akses Role | Contoh Input / Keterangan |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/rooms` | Melihat daftar seluruh kamar beserta statusnya | ✅ Ya | Admin / Staff | `Query Params`: `?status=available&roomTypeId=1&search=101` |
| `GET` | `/rooms/available` | Mencari kamar kosong berdasarkan rentang tanggal | ✅ Ya | Admin / Staff | `Query Params`: `?checkInDate=2026-08-10&checkOutDate=2026-08-12` |
| `GET` | `/rooms/available-today` | Mencari kamar siap huni khusus untuk hari ini | ✅ Ya | Admin / Staff | Memastikan status `available` dan `clean_status = 'clean'`. |
| `GET` | `/rooms/:id` | Mengambil detail informasi kamar + fasilitas | ✅ Ya | Admin / Staff | `Params URL`: `/api/rooms/1` |

### 5. 📅 Reservations (`/reservations`)

| Method | Endpoint | Kegunaan | Butuh Auth? | Akses Role | Contoh Input / Keterangan |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/reservations` | Melihat daftar seluruh reservasi (mendukung filter & pagination) | ✅ Ya | Admin / Staff | `Query Params`: `?status=booked&search=RES-2026&page=1` |
| `POST` | `/reservations` | Membuat reservasi baru dengan Transaksi Database | ✅ Ya | Admin / Staff | `Body JSON`: `{ "guest_id": 1, "rooms": [...] }` |
| `GET` | `/reservations/:id` | Melihat detail reservasi beserta rincian kamar di dalamnya | ✅ Ya | Semua Staff | `Params URL`: `/api/reservations/1` |
| `PATCH` | `/reservations/:id/guest` | Mengubah penanggung jawab (Guest) utama reservasi | ✅ Ya | Admin / Staff | `Body JSON`: `{ "guest_id": 2 }` |
| `DELETE` | `/reservations/:id` | Membatalkan reservasi secara keseluruhan (Soft Delete) | ✅ Ya | Admin / Staff | `Params URL`: `/api/reservations/1` |

### 6. 🚪 Reservation Rooms (`/api/reservations/:id/rooms`)

| Method | Endpoint | Kegunaan | Butuh Auth? | Akses Role | Contoh Input / Keterangan |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/reservation-rooms` | Melihat daftar seluruh kamar yang terikat reservasi | ✅ Ya | Admin / Staff | `Query Params`: `?roomStatus=booked&searchRoomNumber=101` |
| `POST` | `/api/reservation-rooms` | Menambahkan kamar baru ke dalam kode booking yang sudah ada | ✅ Ya | Admin / Staff | `Body JSON`: Data detail kamar & durasi inap tambahan. |
| `PATCH` | `/api/reservation-rooms/:id/checkin` | Memproses Check-In tamu ke kamar fisik | ✅ Ya | Admin / Staff | `Body JSON`: `{ "room_id": 5 }` (Nomor kamar fisik pilihan). |
| `PATCH` | `/api/reservation-rooms/:id/checkout` | Memproses Check-Out tamu | ✅ Ya | Admin / Staff | Mengubah status kamar menjadi selesai/kotor. |
| `PUT` | `/api/reservation-rooms/:id` | Memperbarui detail item kamar reservasi | ✅ Ya | Admin / Staff | `Body JSON`: Data pembaruan kamar. |
| `DELETE` | `/api/reservation-rooms/:id` | Membatalkan salah satu kamar tertentu dalam reservasi | ✅ Ya | Admin / Staff | Mengubah `room_status` menjadi `canceled`. |

```

```
