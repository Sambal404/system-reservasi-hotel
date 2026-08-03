// /src/models/dashboardModel.js

const db = require("../config/db");

const dashboardModel = {
    // Data ringkas kamar
    getRoomSummary: async () => {
        const query = `
            SELECT 
            COUNT(*) AS total_rooms,
            CAST(SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS UNSIGNED) AS available_rooms,
            CAST(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS UNSIGNED) AS occupied_rooms,
            CAST(SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS UNSIGNED) AS maintenance_rooms
            FROM rooms;
        `;
        const [rows] = await db.query(query);
        return rows[0];
    },

    // Data ringkas reservasi
    getReservationSummary: async () => {
        const query = `
            SELECT    
            (SELECT COUNT(*) FROM reservations WHERE DATE(created_at) = CURDATE()) AS reservations_created_today,     
            (SELECT COUNT(*) FROM reservation_rooms WHERE check_in_date = CURDATE() AND room_status = 'booked') AS expected_checkin,     
            (SELECT COUNT(*) FROM reservation_rooms WHERE check_out_date = CURDATE() AND room_status = 'checked_in') AS expected_checkout,     
            (SELECT COUNT(*) FROM reservation_rooms WHERE room_status = 'booked') AS total_reservations;
        `;
        const [rows] = await db.query(query);
        return rows[0];
    },

    // data ringkas tamu
    getGuestSummary: async () => {
        const query = `
            SELECT
            CAST(IFNULL(SUM(total_adults),0) AS UNSIGNED) AS total_adult_guests,
            CAST(IFNULL(SUM(total_children),0) AS UNSIGNED) AS total_child_guests
            FROM reservation_rooms
            WHERE room_status = 'checked_in';
        `;
        const [rows] = await db.query(query);
        return rows[0];
    },

    // data ringkas harian selama n hari
    // efektif jika data sudah lebih lebih dari 7 hari
    // getDailySummary: async ( n = 7 ) => {
    //     const query = `
    //         SELECT 
    //         DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
    //         CAST(SUM(check_in_count) AS UNSIGNED) AS check_in_count,
    //         CAST(SUM(reservation_count) AS UNSIGNED) AS reservation_count,
    //         CAST(SUM(check_out_count) AS UNSIGNED) AS check_out_count
    //         FROM (
    //         -- check_in count
    //         SELECT 
    //             DATE(checked_in_at) AS tanggal, 
    //             1 AS check_in_count, 
    //             0 AS reservation_count, 
    //             0 AS check_out_count
    //         FROM reservation_rooms
    //         WHERE checked_in_at >= CURDATE() - INTERVAL ? DAY

    //         UNION ALL

    //         -- reservation count
    //         SELECT 
    //             DATE(created_at) AS tanggal, 
    //             0 AS check_in_count, 
    //             1 AS reservation_count, 
    //             0 AS check_out_count
    //         FROM reservations
    //         WHERE created_at >= CURDATE() - INTERVAL ? DAY

    //         UNION ALL

    //         -- check_out count
    //         SELECT 
    //             DATE(checked_out_at) AS tanggal, 
    //             0 AS check_in_count, 
    //             0 AS reservation_count, 
    //             1 AS check_out_count
    //         FROM reservation_rooms
    //         WHERE checked_out_at >= CURDATE() - INTERVAL ? DAY
    //         ) AS daily_events
    //         WHERE tanggal IS NOT NULL
    //         GROUP BY tanggal
    //         ORDER BY tanggal ASC
    //     `;

    //     const [rows] = await db.query(query, [n, n, n]);
    //     return rows;
    // },


    getDailySummary: async (n = 7) => {
        const dateList = [];
        const today = new Date();

        // Loop mundur dari hari ini ke beberapa hari ke belakang
        for (let i = n - 1; i >= 0; i--) {
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


  // data reservasi terbaru sebanyak n baris
    getRecentReservations: async () => {

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
    }
};

module.exports = dashboardModel;
