// /server.js 


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


// Load .env
dotenv.config();

// Express
const app = express();


// Routes
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const guestRoutes = require('./src/routes/guestRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
// const usersRoutes = require('./src/routes/userRoutes');


// Middlewares express & cors
app.use(cors()) // Sementara buka untuk semua (dev mode)
app.use(express.json());
// app.use(express.urlencoded({ extended: true })) // hanya untuk testing cepat ( html murni tanpa react frontend)


// ============
// == API V1 ==
// ============
// Auth Routes
app.use('/api/auth', authRoutes);
// Dashboard Routes
app.use('/api/dashboard', dashboardRoutes);
// Guests Routes
app.use('/api/guests', guestRoutes);
// Rooms Routes
app.use('/api/rooms', roomRoutes);
// Reservations Routes
app.use('/api/reservations', reservationRoutes);
// Uers Routes
// app.use('/api/v1/users', userRoutes);


// Global Error Handler
app.use(( err, req, next ) => {
  console.log(err);
  res
    .status( err.status || 500 )
    .json( { 
      success: false,
      error: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "API Grand Nusantara Hotel Running Normal"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});