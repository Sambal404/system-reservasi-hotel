# 🗄️ Database Setup & Documentation

Folder ini berisi skrip SQL untuk inisialisasi struktur database, data awal (seeders), serta objek pembantu seperti Views, Triggers, dan Stored Procedures untuk sistem Hotel Property Management System (PMS).

---

## 📁 Struktur Direktori

```text
database/
├── procedures/            # Stored Procedures untuk logika kompleks
├── seeders/               # File seeder spesifik per modul
├── triggers/              # Database Triggers (Audit log, auto-update)
├── views/                 # SQL Views (Monitoring kamar, summary)
├── init.sql               # [WAJIB 1] Skema DDL utama (14 Tabel)
└── seeders_full_version.sql # [WAJIB 2] Data awal dasar (Master & Dummy)

```

---

## ⚠️ Urutan Eksekusi Wajib

Agar tidak terjadi error Foreign Key, eksekusi file harus dilakukan sesuai urutan nomor di bawah ini:

1. **init.sql** (Wajib Pertama) – Membuat struktur database & 14 tabel utama.
2. **seeders_full_version.sql** (Wajib Kedua) – Mengisi data master & dummy awal.
3. **views/, triggers/, procedures/** (Opsional) – Dijalankan sesuai fitur yang dibutuhkan.

---

## 🛠️ Cara Menjalankan Script

Pilih salah satu metode di bawah ini:

### Cara 1: Menggunakan Command Line (Terminal / CMD)

Buka Terminal/CMD di dalam folder database, lalu jalankan perintah berikut secara berurutan:

#### 1. Jalankan init.sql:

```bash
mysql -u root -p < init.sql

```

#### 2. Jalankan seeders_full_version.sql:

```bash
mysql -u root -p hotel_db < seeders_full_version.sql

```

#### 3. Jalankan Views / Procedures / Triggers (Opsional):

```bash
mysql -u root -p hotel_db < views/vw_room_monitoring.sql

```

---

### Cara 2: Menggunakan MySQL Workbench

1. Buka MySQL Workbench dan masuk ke koneksi database Anda.
2. Buka file **init.sql** (Ctrl + O) atau drag-and-drop, lalu klik ikon Petir ⚡ (Execute).
3. Buka file **seeders_full_version.sql**, lalu klik ikon Petir ⚡.
4. *(Opsional)* Buka file SQL lainnya dari folder views/, triggers/, atau procedures/ dan klik ikon Petir ⚡.
5. Klik kanan pada panel Schemas di sebelah kiri -> pilih Refresh All.

```

```
