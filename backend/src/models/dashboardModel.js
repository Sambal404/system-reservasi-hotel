// /src/models/dashboardModel.js

const db = require('../config/db');

const dashboardModel = {
    // 1. Ringkasan Status Kamar
    getRoomSummary: async () => {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) AS total_rooms,
                CAST(SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS UNSIGNED) AS available_rooms,
                CAST(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS UNSIGNED) AS occupied_rooms,
                CAST(SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS UNSIGNED) AS maintenance_rooms
            FROM rooms;`
        );
        return rows[0];
    },

    // 2. Ringkasan Operasional & Reservasi
    getReservationSummary: async () => {
        const [rows] = await db.query(
            `SELECT    
                (SELECT COUNT(*) FROM reservations WHERE DATE(created_at) = CURDATE()) AS reservations_created_today,     
                (SELECT COUNT(*) FROM reservation_rooms WHERE check_in_date = CURDATE() AND room_status = 'booked') AS expected_checkin,     
                (SELECT COUNT(*) FROM reservation_rooms WHERE check_out_date = CURDATE() AND room_status = 'checked_in') AS expected_checkout,     
                (SELECT COUNT(*) FROM reservation_rooms WHERE room_status = 'booked') AS total_reservations;`
        );
        return rows[0];
    },

    // 3. Ringkasan Tamu yang Sedang Menginap
    getGuestSummary: async () => {
        const [rows] = await db.query(
            `SELECT
                CAST(IFNULL(SUM(total_adults),0) AS UNSIGNED) AS total_adult_guests,
                CAST(IFNULL(SUM(total_children),0) AS UNSIGNED) AS total_child_guests
            FROM reservation_rooms
            WHERE room_status = 'checked_in';`
        );
        return rows[0];
    },

    getDailySummary: async (days = 7) => {
        const dateList = [];
        const today = new Date();

        // Loop mundur dari hari ini ke beberapa hari ke belakang
        for (let i = days - 1; i >= 0; i--) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);

            // Format tanggal secara manual ke YYYY-MM-DD agar aman dari perbedaan zona waktu
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            
            dateList.push(`${year}-${month}-${day}`);
        }

        // 2. Query data untuk setiap tanggal yang di-generate oleh JS
        const summaryPromises = dateList.map(async (targetDate) => {
            const [rows] = await db.query(
                `SELECT 
                    ? AS tanggal,
                    (SELECT COUNT(*) FROM reservation_rooms WHERE DATE(checked_in_at) = ?) AS check_in_count,
                    (SELECT COUNT(*) FROM reservations WHERE DATE(created_at) = ?) AS reservation_count,
                    (SELECT COUNT(*) FROM reservation_rooms WHERE DATE(checked_out_at) = ?) AS check_out_count;`,
                [targetDate, targetDate, targetDate, targetDate]
            );
            return rows[0];
        });

        // Jalankan secara paralel agar cepat
        const results = await Promise.all(summaryPromises);
        return results;
    },

    // 4. Data Reservasi Terakhir (Tanpa View, langsung JOIN tabel asli)
    getRecentReservations: async () => {
        try {

            // Wajib Jalankan /database/views/vw_reservation_long_summary.sql
            // const [rows] = await db.query(
            //     `SELECT 
            //         reservation_id,
            //         reservation_code,
            //         guest_name,
            //         reservation_status,
            //         payment_status,
            //         JSON_ARRAYAGG(
            //             JSON_OBJECT(
            //                 'room_type_name', room_type_name,
            //                 'total_rooms', total_rooms
            //             )
            //         ) AS rooms_detail,
            //         created_by
            //     FROM vw_reservation_long_summary
            //     GROUP BY 
            //         reservation_id,
            //         reservation_code,
            //         guest_name,
            //         reservation_status,
            //         payment_status,
            //         created_by;`
            // );

            // Tanpa view bisa langsung pakai (Jangan tanya gw juga gak ngerti)
            const [rows] = await db.query(
                `WITH RoomCounts AS (
                    SELECT 
                        rr.reservation_id,
                        rt.name AS room_type_name,
                        COUNT(rr.id) AS total_rooms
                    FROM reservation_rooms rr
                    JOIN room_types rt ON rr.room_type_id = rt.id
                    GROUP BY rr.reservation_id, rt.id, rt.name
                ),
                RoomJSONAgg AS (
                    SELECT 
                        reservation_id,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'room_type_name', room_type_name,
                                'total_rooms', total_rooms
                            )
                        ) AS rooms_detail
                    FROM RoomCounts
                    GROUP BY reservation_id
                )
                SELECT 
                    r.id AS reservation_id,
                    r.reservation_code,
                    g.name AS guest_name,
                    r.status AS reservation_status,
                    r.payment_status,
                    ra.rooms_detail,
                    e.full_name AS created_by
                FROM reservations r
                JOIN guests g ON r.guest_id = g.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN employees e ON u.employee_id = e.id
                LEFT JOIN RoomJSONAgg ra ON r.id = ra.reservation_id;`
            )

            // Cek apakah data ada dan lakukan parsing jika diperlukan
            if (!rows) return [];
            
            return rows.map(row => ({
                ...row,
                rooms_detail: typeof row.rooms_detail === 'string' ? JSON.parse(row.rooms_detail) : row.rooms_detail
            }));
        } catch (error) {
            console.error("DETAIL ERROR getRecentReservations:", error);
            throw error;
        }
    }
}
module.exports = dashboardModel;