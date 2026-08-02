// /src/models/reservationModel.js

const db = require('../config/db');
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
            `INSERT INTO reservations (reservation_code, guest_id, user_id, status) 
            VALUES (?, ?, ?, 'booked')`,
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

    // READ Ambil Semua Reservasi (Bisa ditambah filter nanti)
    getReservations: async () => {
        const query = `
        SELECT r.id AS reservation_id, r.reservation_code, r.guest_id, g.name AS guest_name, r.status, r.payment_status 
        FROM reservations r 
        JOIN guests g ON r.guest_id = g.id
        ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // READ Ambil Data Reservasi
    getReservations: async ({ search, status, limit = 20, offset = 0 } = {}) => {
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
  }
};

module.exports = reservationModel;