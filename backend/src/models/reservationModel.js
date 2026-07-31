// src/models/reservationModel.js

const db = require('../config/db');
const crypto = require('crypto');

const ReservationModel = {
  
    createReservationTransaction: async (guest_id, user_id, rooms) => {
        // Start Connection
        const connection = await db.getConnection();
        
        try {
            // Start Transaction
            await connection.beginTransaction();

            // Generate Code Reservasi | Contoh: RES-9201-A3F9 
            const randomString = crypto.randomBytes(2).toString('hex').toUpperCase();
            const reservationCode = `RES-${Date.now().toString().slice(-4)}-${randomString}`;

            // Insert ke table Utama: reservations
            const [reservationResult] = await connection.query(
                `INSERT INTO reservations (reservation_code, guest_id, user_id, status, payment_status) 
                VALUES (?, ?, ?, 'confirmed', 'pending')`,
                [reservationCode, guest_id, user_id]
            );

            const reservationId = reservationResult.insertId; // Ambil reservasi id yang baru

        // Proses detail kamar (reservation_rooms)
        for (const item of rooms) {
            const { room_type_id, quantity, check_in_date, check_out_date } = item;

            await connection.query(
            `SELECT id FROM room_types WHERE id = ? FOR UPDATE`,
            [room_type_id]
            );

            // Cek jumlah kamar
            const [totalPhysicalRooms] = await connection.query(
            `SELECT COUNT(*) AS total FROM rooms WHERE room_type_id = ?`,
            [room_type_id]
            );
            const maxCapacity = totalPhysicalRooms[0].total;

            // Hitung kamar yang terbooking
            const [bookedRooms] = await connection.query(
                `SELECT COUNT(rr.id) AS booked_count
                FROM reservation_rooms rr
                WHERE rr.room_type_id = ? 
                AND rr.room_status IN ('booked','checked_in')
                AND (rr.check_in_date < ? AND rr.check_out_date > ?)`,
                [room_type_id, check_out_date, check_in_date]
            );

            const currentBooked = bookedRooms[0].booked_count;

            // Hitung kamar tersedia 
            const availableQuota = maxCapacity - currentBooked;
            
            if (availableQuota < quantity) {
                // Lempar error -> catch rollback
                throw new Error(`Kamar untuk tipe ID ${room_type_id} tidak mencukupi. Sisa kuota: ${availableQuota}, diminta: ${quantity}`);
            }

            // Insert reservasi kamar satu persatu
            for (let i = 0; i < quantity; i++) {
            await connection.query(
                `INSERT INTO reservation_rooms (reservation_id, room_type_id, room_id, check_in_date, check_out_date, room_status) 
                VALUES (?, ?, NULL, ?, ?, 'booked')`,
                [reservationId, room_type_id, check_in_date, check_out_date]
            );
            }
        }

        // Jika semua aman, commit transaksi ke database
        await connection.commit();
        return { success: true, reservationId, reservationCode };

    } catch (error) {
        // Batalkan transaksi jika error
        await connection.rollback();
        throw error; 
    } finally {
        // Close connection
        connection.release();
    }
},

getAllReservations: async () => {
        // Fungsi ini bisa kita biarkan atau kita hubungkan dengan view v_reservation_summary
        const [rows] = await db.query(
            `SELECT
                r.id AS reservation_id,
                r.reservation_code,
                g.name AS guest_name, 
                r.status AS reservation_status,
                r.payment_status,
                r.created_at,
                r.user_id as created_by
            FROM reservations r
            JOIN guests g ON r.guest_id = g.id
            ORDER BY r.created_at DESC`
        );
        return rows;
    }
};

module.exports = ReservationModel;