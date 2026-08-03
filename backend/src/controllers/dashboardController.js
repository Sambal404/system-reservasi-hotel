// /src/controllers/dashboardController.js

const dashboardModel = require('../models/dashboardModel');

// Variabel global untuk menyimpan semua koneksi browser yang sedang aktif
let clients = [];

// Endpoint untuk memulai koneksi Real-time (SSE)
const streamDashboard = (req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    res.write(`data: {"message": "Connected to Dashboard Stream"}\n\n`);
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
};

// Fungsi ini dipanggil setiap kali ada perubahan data
const broadcastDashboardUpdate = () => {
    const payload = JSON.stringify({ trigger: 'REFRESH_DASHBOARD' });
    clients.forEach(client => {
        client.write(`data: ${payload}\n\n`); 
    });
};

const getDashboardData = async (req, res, next) => { 
    try {
        const roomSummary = await dashboardModel.getRoomSummary();
        const reservationSummary = await dashboardModel.getReservationSummary();
        const guestSummary = await dashboardModel.getGuestSummary();
        const dailySummary = await dashboardModel.getDailySummary(7); // log 7 hari
        const recentReservations = await dashboardModel.getRecentReservations(10);

        // Debug log
        console.log("Room Summary:", roomSummary);
        console.log("Reservation Summary:", reservationSummary);
        console.log("Guest Summary:", guestSummary);
        console.log("Daily Summary:", dailySummary);
        console.log("Recent Reservations:", recentReservations);

        return res.status(200).json({
            success: true,
            data: {
                room_summary: roomSummary,
                reservation_summary: reservationSummary,
                guest_summary: guestSummary,
                daily_summary: dailySummary,
                recent_reservations: recentReservations
            }
        });
    } catch (err) {
        console.error("Error pada auth /api/v1/dashboard :", err);
        next(err);
    }
};

module.exports = { 
    getDashboardData, 
    streamDashboard, 
    broadcastDashboardUpdate 
};