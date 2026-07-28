# System-Reservasi-Hotel

Aplikasi web internal untuk membantu **Staf Front Office** mengelola data tamu, pemesanan kamar (reservasi), *check-in*, *check-out*, serta memantau ketersediaan kamar secara *real-time* di **Grand Nusantara Hotel**.

Proyek ini merupakan bagian dari **Project Kelompok A**, yang terhubung dengan sistem housekeeping milik **Kelompok B** melalui database sebagai satu sumber data status kamar yang sama.

---

## 📌 Fungsi Aplikasi

| Fitur | Deskripsi |
| --- | --- |
| **Login** | Autentikasi staf Front Office atau Admin menggunakan JWT |
| **Dashboard / Overview** | Ringkasan status kamar saat ini, total reservasi aktif, serta statistik tamu harian |
| **Data Tamu** | Kelola informasi profil dan kontak tamu hotel |
| **Manajemen Reservasi** | Pembuatan, perubahan, dan pembatalan pesanan kamar oleh tamu |
| **Check-In & Check-Out** | Proses kedatangan dan kepulangan tamu yang langsung memperbarui status kamar |
| **Status Kamar** | Melihat ketersediaan kamar secara *real-time* (Available / Terisi / Maintenance) |
| **Pencarian** | Pencarian cepat data reservasi atau tamu dari sidebar |

Saat status kamar berubah karena *check-in* atau *check-out*, **status kamar tersinkron otomatis** dengan Aplikasi housekeeping kelompok B — tidak perlu update manual di dua tempat berbeda.

---

## 🛠️ Teknologi yang Digunakan

| Layer | Teknologi |
| --- | --- |
| **Backend** | Node.js + **Express.js**, MySQL (`mysql2`), JWT untuk autentikasi, bcryptjs untuk hashing password |
| **Frontend** | **React** (Vite), React Router, Axios untuk konsumsi REST API |
| **Database** | MySQL / MariaDB |

---

## 📁 Struktur Repository

```
System-Reservasi-Hotel/
│
├── server-side/                         # Backend (Express)
│   ├── node_modules/
│   ├── config/
│   │   └── db.js                        # koneksi ke MySQL
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── guestController.js
│   │   ├── reservationController.js
│   │   └── roomController.js
│   ├── middleware/
│   │   ├── auth.js                      # verifikasi JWT & role
│   │   └── errorHandler.js              # penanganan error terpusat
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── guestRoutes.js
│   │   ├── reservationRoutes.js
│   │   └── roomRoutes.js
│   ├── database/
│   │   └── schema.sql                   # struktur tabel + data contoh
│   ├── .env                             # tidak ikut di-push ke GitHub
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                        # entry point: setup Express + jalankan server
│
└── react-frontend/                      # Frontend (React)
    ├── public/                          # favicon ...
    ├── src/
    │   ├── assets/                      
    │   ├── pages/                       # Login, Dashboard, Guests, Reservations, Rooms
    │   ├── components/
    │   ├── services/                    # axios instance & pemanggilan API
    │   └── App.jsx
    ├── index.html
    ├── .env.example
    └── package.json

```

---

## 🚀 Cara Menggunakan Repo (Mulai dari Fork)

Panduan ini untuk anggota tim/kontributor baru yang ingin mulai berkontribusi dari nol.

### 1. Fork repository

1. Buka halaman repository **Sistem-Reservasi-Hotel** ini di GitHub.
2. Klik tombol **Fork** di pojok kanan atas → pilih akun GitHub kamu sebagai tujuan fork.
3. Setelah selesai, kamu akan punya salinan repo ini di akun GitHub-mu sendiri, misalnya:
`[https://github.com/](https://github.com/)<username-kamu>/Sistem-Reservasi-Hotel`

### 2. Clone hasil fork ke komputer lokal

```bash
git clone https://github.com/<username-kamu>/Sistem-Reservasi-Hotel.git
cd Sistem-Reservasi-Hotel

```

### 3. Hubungkan ke repo asli (upstream)

Supaya kamu bisa menarik update terbaru dari repo tim:

```bash
git remote add upstream https://github.com/Sambal404/Sistem-Reservasi-Hotel.git
git remote -v

```

### 4. Siapkan database

1. Buat database MySQL baru:
```sql
CREATE DATABASE grand_nusantara_hotel;

```


2. Import skema dan data contoh:
```bash
mysql -u root -p grand_nusantara_hotel < server-side/database/schema.sql

```



### 5. Jalankan Backend (server-side)

```bash
cd server-side
npm install

```

Buat file `.env` di dalam folder `server-side/` (belum ada di repo karena di-`.gitignore`), isinya:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=grand_nusantara_hotel
JWT_SECRET=ganti_dengan_string_acak_yang_panjang
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173

```

Jalankan server:

```bash
npm run dev

```

Backend akan berjalan di `http://localhost:5000`. Cek apakah sudah aktif lewat:

```bash
curl http://localhost:5000/api/health

```

### 6. Jalankan Frontend (react-frontend)

Buka terminal baru:

```bash
cd react-frontend
npm install
cp .env.example .env

```

Pastikan `.env` frontend mengarah ke URL backend:

```
VITE_API_BASE_URL=http://localhost:5000/api

```

Jalankan aplikasi:

```bash
npm run dev

```

Frontend akan berjalan di `http://localhost:5173` (default Vite).

### 7. Login dengan akun contoh

Gunakan salah satu akun dari data contoh di `schema.sql`:

| Username | Password | Role |
| --- | --- | --- |
| `frontoffice01` | `hashed_pw` | Front Office Staff |

> ⚠️ Password di data contoh masih plaintext untuk kemudahan testing lokal. **Jangan pernah dipakai di lingkungan production** — ganti dengan password yang di-hash menggunakan bcrypt sebelum deploy.

### 8. Membuat perubahan & mengirim Pull Request

1. Buat branch baru untuk fitur/perbaikan yang kamu kerjakan:
```bash
git checkout -b fitur/nama-fiturmu

```


2. Lakukan perubahan, lalu commit:
```bash
git add .
git commit -m "Menambahkan fitur ..."

```


3. Push ke fork kamu:
```bash
git push origin fitur/nama-fiturmu

```


4. Buka GitHub → repo fork kamu → klik **Compare & pull request** → arahkan ke branch `main` di repo asli tim.
5. Tulis deskripsi perubahan yang jelas, lalu submit PR untuk di-review anggota tim lain.

### 9. Menyinkronkan fork dengan update terbaru dari tim

Sebelum mulai kerjakan fitur baru, selalu tarik update terbaru dulu:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

```

---

## 📡 Ringkasan Endpoint API

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Login staf front office | ❌ |
| GET | `/api/auth/me` | Profil staf yang sedang login | ✅ |
| GET | `/api/guests` | Daftar data tamu hotel | ✅ |
| POST | `/api/guests` | Tambah data tamu baru | ✅ |
| GET | `/api/reservations` | Daftar seluruh transaksi reservasi | ✅ |
| POST | `/api/reservations` | Buat pemesanan/reservasi baru | ✅ |
| PUT | `/api/reservations/:id/checkin` | Proses check-in tamu | ✅ |
| PUT | `/api/reservations/:id/checkout` | Proses check-out tamu | ✅ |
| PUT | `/api/reservations/:id/cancel` | Batalkan reservasi | ✅ |
| GET | `/api/rooms` | Daftar kamar dan status ketersediaan | ✅ |

Semua endpoint yang butuh login mengharuskan header:

```
Authorization: Bearer <token>

```

---

## 👥 Tim

Project Kelompok A — Sistem Reservasi Hotel
 - 

## 📄 Lisensi

Proyek ini dibuat untuk keperluan tugas akademik.


ajis main epep

ajis banyak yapping