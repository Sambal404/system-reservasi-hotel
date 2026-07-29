
# 🏨 Reservasi Grand Nusantara Hotel - Backend

Backend API untuk aplikasi Reservasi Grand Nusantara Hotel yang dibangun menggunakan **Node.js**, **Express**, dan **MySQL**. Proyek ini dikembangkan oleh **Kelompok A** untuk kegiatan OJT.

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

```

```
