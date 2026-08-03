// /src/models/reservationModel.js

const db = require('../config/db');
const { getReservationById } = require('../controllers/reservationController');
const genReservationCode = require('../utils/generateReservationCode');

const reservationModel = {

    createReservation: async (guest_id, user_id, rooms) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // generate reservation code dengan function helper 
            const reservation_code = genReservationCode('REV'); // contoh: REV-20260802-F0B4

            // Insert ke tabel reservations (Parent)
            const [resResult] = await connection.execute(
                `INSERT INTO reservations (reservation_code, guest_id, user_id) 
                VALUES (?, ?, ?)`,
                [reservation_code, guest_id, user_id]
            );

            const reservation_id = resResult.insertId;

            // Insert ke tabel reservation_rooms (Bisa lebih dari 1 kamar)
            for (const room of rooms) {
                await connection.execute(
                `INSERT INTO reservation_rooms 
                (reservation_id, room_type_id, room_id, price_per_night, check_in_date, check_out_date, total_adults, total_children, room_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked')`,
                [
                    reservation_id, 
                    room.room_type_id, 
                    room.room_id || null, 
                    room.price_per_night, 
                    room.check_in_date, 
                    room.check_out_date, 
                    room.total_adults || 1, 
                    room.total_children || 0
                ]
                );
            }

            await connection.commit();
            return reservation_id;

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    },

    getReservationById : async (reservationId) => {
        const [rows] = await db.query(
            `SELECT 
            r.id AS reservation_id,
            r.reservation_code,
            r.guest_id,
            g.name AS guest_name,
            r.total_price,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'room_type_id', rr.room_type_id,
                    'room_type_name', rt.name,
                    'room_id', rr.room_id,
                    'room_number', rm.room_number,
                    'price_per_night', rr.price_per_night,
                    'total_adults', rr.total_adults,
                    'total_children', rr.total_children,
                    'room_status', rr.room_status,
                    'check_in_date', rr.check_in_date,
                    'check_out_date', rr.check_out_date,
                    'checked_in_at', rr.checked_in_at,
                    'checked_in_by', rr.check_in_by,
                    'checked_out_at', rr.checked_out_at,
                    'checked_out_by', rr.check_out_by
                )
            ) AS detail_reservations,
            r.user_id
            FROM reservations r
            JOIN guests g ON r.guest_id = g.id
            JOIN reservation_rooms rr ON r.id = rr.reservation_id
            JOIN room_types rt ON rr.room_type_id = rt.id
            LEFT JOIN rooms rm ON rr.room_id = rm.id
            WHERE r.id = ?
            GROUP BY 
            r.id, 
            r.reservation_code, 
            r.guest_id, 
            g.name, 
            r.total_price,
            r.user_id;`,
            [reservationId]
        );
        return rows[0] || null;
    },

    // READ Ambil Data Reservasi
    getAllReservations: async ({ search, status, limit = 20, offset = 0 } = {}) => {
        let query = `
            SELECT 
                r.id AS reservation_id,
                r.reservation_code,
                r.guest_id,
                g.name AS guest_name, 
                g.phone AS guest_phone, 
                r.status, 
                r.payment_status, 
                r.created_at
            FROM reservations r 
            JOIN guests g ON r.guest_id = g.id 
            WHERE 1=1
        `;
        
        const queryParams = [];

        // Filter berdasarkan Pencarian (Kode reservasi atau Nama tamu)
        if (search) {
        const searchKeyword = `%${search}%`;
            query += ` AND (r.reservation_code LIKE ? OR g.name LIKE ?)`;
            queryParams.push(searchKeyword, searchKeyword);
        }

        // Filter berdasarkan Status Reservasi
        if (status) {
            query += ` AND r.status = ?`;
            queryParams.push(status);
        }

        // Urutan dan Pagination
        query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(Number(limit), Number(offset));

        // Eksekusi kueri data dan kueri total hitungan data
        const [rows] = await db.query(query, queryParams);

        return rows;
    },

  // UPDATE ubah Penanggung Jawab Reservasi (Guest)
    updateGuestOfReservation: async (reservationId, newGuestId) => {
        const [result] = await db.execute(
            `UPDATE reservations 
            SET guest_id = ? 
            WHERE id = ?`,
        [newGuestId, reservationId]
        );
        return result.affectedRows;
    },


    // DELETE soft delete (cancel reeservations)
    cancelReservation: async (reservationId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Update status reservation (parent) menjadi canceled
            const [resResult] = await connection.query(
                `UPDATE reservations SET status = 'canceled' WHERE id = ?`,
                [reservationId]
            );

            if (resResult.affectedRows === 0) {
                await connection.rollback();
                return { success: false, message: "Reservasi tidak ditemukan" };
            }

            // Update reservation_rooms (child) status menjadi canceled
            await connection.query(
            `UPDATE reservation_rooms SET room_status = 'canceled' WHERE reservation_id = ? AND room_status != 'checked_out'`,
            [reservationId]
            );

            await connection.commit();
            return { 
                success: true, 
                message: "Reservasi berhasil dibatalkan" 
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = reservationModel;