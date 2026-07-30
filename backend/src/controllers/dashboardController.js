// /src/controllers/dashboardController.js

const db = require('../config/db');

// Variabel global untuk menyimpan semua koneksi browser yang sedang aktif
let clients = [];

// Endpoint untuk memulai koneksi Real-time (SSE)
const streamDashboard = (req, res) => {
    // Set Header wajib untuk Server-Sent Events
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    // Kirim pesan sukses pertama kali (\n\n wajib entah kenapa)
    res.write(`data: {"message": "Connected to Dashboard Stream"}\n\n`);

    // Simpan koneksi (response) ini ke dalam daftar clients
    clients.push(res);

    // Jika browser ditutup atau pindah halaman, hapus dari daftar agar tidak memory leak
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
};

// Fungsi ini dipanggil setiap kali ada perubahan data
const broadcastDashboardUpdate = () => {
    const payload = JSON.stringify({ trigger: 'REFRESH_DASHBOARD' });
    
    // Kirim sinyal ke SEMUA client yang sedang terhubung
    clients.forEach(client => {
        // Format Wajib SSE: diawali "data: " dan diakhiri "\n\n" entah kenapa
        client.write(`data: ${payload}\n\n`); 
    });
};

const getDashboardData = async (req, res) => { 
    try {

        // bisa menggunakan view jika sudah menggunakan script
        // /database/script/views/vw_room_status_summary.sql
        // const [roomSummary] = await db.query(`SELECT * from vw_room_status_summary;`);

        const [roomSummary] = await db.query(
            `SELECT 
            COUNT(*) AS total_rooms,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_rooms,
            SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied_rooms,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_rooms
            FROM rooms;`
        );

        console.log (roomSummary);

        
        // bisa menggunakan view jika sudah menggunakan script
        // /database/script/views/vw_daily_operation_summary.sql
        // const [opsSummary] = await db.query("SELECT * FROM vw_daily_operation_summary");

        const [reservationSummary] = await db.query(
            `SELECT    
            (SELECT COUNT(*) FROM reservations WHERE DATE(created_at) = CURDATE()) AS reservations_created_today,     
            (SELECT COUNT(*) FROM reservation_rooms WHERE check_in_date = CURDATE() AND room_status = 'booked') AS expected_checkin,     
            (SELECT COUNT(*) FROM reservation_rooms WHERE check_out_date = CURDATE() AND room_status = 'checked_in') AS expected_checkout,     
            (SELECT COUNT(*) FROM reservation_rooms WHERE room_status = 'booked') AS total_future_reservations;`
        );

        console.log(reservationSummary);
        

        // bisa menggunakan view jika sudah menggunakan script
        // /database/script/views/vw_recent_reservations.sql
        // const [recentReservations] = await db.query('SELECT * FROM vw_recent_reservations;');

        // Data Reservasi Terakhir 25 ROW
        const [recentReservations] = await db.query(
            `SELECT 
                r.reservation_code,
                g.name AS guest_name,
                MIN(rr.check_in_date) AS check_in_date,
                MAX(rr.check_out_date) AS check_out_date,
                r.status,
                r.created_at
            FROM reservations r
            JOIN guests g ON r.guest_id = g.id
            JOIN reservation_rooms rr ON r.id = rr.reservation_id
            GROUP BY 
                r.id, 
                r.reservation_code, 
                g.name, 
                r.status, 
                r.created_at
            ORDER BY r.created_at DESC
            LIMIT 25;`
        );

        console.log(recentReservations);


        return res.status(200).json({
            success: true,
            data: {
                rooms: roomSummary[0],
                operations: opsSummary[0],
                recent_reservations: recentReservations
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ success: false, message: "Gagal load dashboard" });
    }
};

module.exports = { 
    getDashboardData, 
    streamDashboard, 
    broadcastDashboardUpdate 
};