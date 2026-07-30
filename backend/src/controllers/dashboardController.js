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
            CAST(SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS UNSIGNED) AS available_rooms,
            CAST(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS UNSIGNED) AS occupied_rooms,
            CAST(SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS UNSIGNED) AS maintenance_rooms
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
            (SELECT COUNT(*) FROM reservation_rooms WHERE room_status = 'booked') AS total_reservations;`
        );

        
        console.log(reservationSummary);
        
        const [guestSummary] = await db.query(
            `SELECT
            CAST(IFNULL(SUM(total_adults),0) AS UNSIGNED) AS total_adult_guests,
            CAST(IFNULL(SUM(total_children),0) AS UNSIGNED) As total_child_guests
            FROM reservation_rooms
            WHERE room_status = 'checked_in';`
        )

        console.log(guestSummary);

        // bisa menggunakan view jika sudah menggunakan script
        // /database/script/views/vw_recent_reservations.sql
        // const [recentReservations] = await db.query('SELECT * FROM vw_recent_reservations;');

        // Data Reservasi Terakhir 25 ROW
        const [recentReservations] = await db.query(
            `SELECT 
            reservation_id,
            reservation_code,
            guest_name,
            reservation_status,
            payment_status,
            -- Membungkus detail kamar ke dalam Array of Objects
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'room_type_name', room_type_name,
                    'total_rooms', total_rooms
                )
            ) AS rooms_detail,
            created_by
        FROM vw_reservation_long_summary
        GROUP BY 
            reservation_id,
            reservation_code,
            guest_name,
            reservation_status,
            payment_status,
            created_by;`
        );

        console.log(recentReservations);


        return res.status(200).json({
            success: true,
            data: {
                room_summary: roomSummary[0],
                reservation_summary: reservationSummary[0],
                guest_summary: guestSummary[0],
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