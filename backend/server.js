// server.js //

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// ROUTES
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes')

dotenv.config();

const app = express();

app.use(cors()); // buka untuk semua
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/api/auth', authRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);


// basic error handler
app.use((err, req, res, next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.json({ message: 'API Sistem Reservasi Hotel Berjalan Normal' });
});
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});
