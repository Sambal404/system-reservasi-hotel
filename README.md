
# 🏨 Sistem Reservasi Hotel (Grand Nusantara Hotel)

Repositori utama untuk aplikasi **Front Office Management Sistem Reservasi Hotel** yang dikembangkan oleh **Kelompok A** untuk kegiatan OJT. Sistem ini dirancang untuk menangani operasional front office secara menyeluruh mulai dari manajemen kamar, reservasi, proses *check-in*, *check-out*, hingga pencatatan pembayaran.

---

## 🏗️ Struktur Proyek & Tech Stack

Proyek ini menggunakan arsitektur monorepo terpisah antara *backend* dan *frontend* dengan database relasional MySQL:

* **Backend:** Node.js, Express, MySQL (`/backend`)
* **Frontend:** React (`/frontend`)
* **Database:** MySQL (`/backend/database`)

```

system-reservasi-hotel/
├── backend/         # API & Server Node.js (CommonJS, Express)
└──  frontend/        # Antarmuka Pengguna React

```

---

## 📌 Fitur Utama Sistem

* **Front Office Management:** Dashboard pemantauan status kamar secara real-time.
* **Reservasi Kamar:** Pengelolaan data tamu, pemilihan tipe kamar, dan penjadwalan.
* **Check-In & Check-Out:** Alur proses kedatangan dan kepulangan tamu hotel.
  
---

## 👥 Panduan Kolaborasi Tim & Penggunaan Branch (Khusus Pemula)

Karena repositori ini menggunakan sistem **Git Collaborator** dan banyak anggota tim yang masih pemula, **dilarang keras langsung melakukan perubahan (*commit/push*) ke branch `main**`. Kita wajib menggunakan *Branch* terpisah untuk setiap fitur agar kode utama tetap aman dan tidak mudah rusak (*conflict*).

### 1. Aturan Dasar Branch

* **`main`**: Branch utama yang bersih, stabil, dan siap jalan. Tidak boleh ada yang *coding* langsung di sini.
* **Feature Branch**: Branch turunan yang wajib dibuat setiap kali Anda ingin mengerjakan tugas/fitur baru.

---

### 2. Panduan Langkah-Langkah Menggunakan Branch (Step-by-Step)

Ikuti alur kerja ini setiap kali Anda akan mulai mengerjakan tugas baru:

#### A. Ambil Update Terbaru dari `main`

Sebelum membuat branch baru, pastikan posisi Anda di branch `main` dan ambil kode terbaru:

```bash
git checkout main
git pull origin main

```

#### B. Buat Branch Baru untuk Fitur Anda

Buat branch dengan nama yang merepresentasikan tugas Anda (gunakan format: `fitur/nama-fitur` atau `fix/nama-bug`):

```bash
# Contoh membuat branch untuk fitur reservasi:
git checkout -b fitur/reservasi-kamar

```

*(Perintah `-b` otomatis membuat branch baru sekaligus memindahkan Anda ke branch tersebut).*

#### C. Lakukan Perubahan & Commit Sering-Sering

Kerjakan kodingan Anda di dalam branch tersebut. Jika sudah selesai bagian tertentu, simpan (*commit*) dengan pesan yang jelas:

```bash
git add .
git commit -m "feat: add reservation form validation"

```

#### D. Kirim Branch ke GitHub (Push)

Kirim branch buatan Anda ke server GitHub agar bisa direview oleh tim:

```bash
git push origin fitur/reservasi-kamar

```

#### E. Menggabungkan Kode ke `main` (Merge via Pull Request / Kolaborasi)

1. Buka repository GitHub di browser.
2. Anda akan melihat tombol hijau **"Compare & pull request"**. Klik tombol tersebut.
3. Buat *Pull Request* (PR) untuk menggabungkan branch Anda ke branch `main`.
4. Diskusikan atau minta rekan tim (*collaborator*) untuk memeriksa kode Anda sebelum ditekan tombol **Merge**.

---

### 3. Standar Penulisan Pesan Commit (Commit Message)

Gunakan format commit yang jelas berdasarkan jenis perubahan agar mudah dibaca oleh tim:

* `feat: [nama_fitur]` — Untuk penambahan fitur baru (contoh: `feat: add check-in API endpoint`)
* `fix: [deskripsi_bug]` — Untuk perbaikan *bug* atau error (contoh: `fix: resolve room status calculation bug`)
* `style: [deskripsi]` — Untuk perubahan tampilan, CSS, atau format kode tanpa mengubah logika
* `chore: [deskripsi]` — Untuk pemeliharaan file konfigurasi, dependensi, atau penambahan file README

---

## ⚙️ Panduan Singkat Menjalankan Proyek

### 1. Konfigurasi Database

* Masuk ke folder `database/`, jalankan file `init.sql` lalu `seeders_full_version.sql` pada MySQL Anda untuk menyiapkan database `hotel_db`.

### 2. Menjalankan Backend (`/backend`)

1. Masuk ke folder backend: `cd backend`
2. Buat file `.env` (sesuaikan dengan `.env-example` yang ada).
3. Install dependensi dan jalankan server:
```bash
npm install
npm run dev

```



### 3. Menjalankan Frontend (`/frontend`)

1. Masuk ke folder frontend: `cd frontend`
2. Install dependensi dan jalankan *development server*:
```bash
npm install
npm run dev

```



```

```
---

## 👥 Tim

Project Kelompok A — Sistem Reservasi Hotel

*



---
Proyek ini dibuat untuk keperluan tugas akademik.
