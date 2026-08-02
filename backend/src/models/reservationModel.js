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

  // READ Ambil Detail Reservasi (JOIN yang sudah Anda siapkan)
  getReservation: async (reservationId) => {
    const query = `
      SELECT r.id AS reservation_id, r.reservation_code, r.guest_id, g.name AS guest_name, r.status,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'room_type_id', rr.room_type_id, 
          'room_id', rr.room_id, 
          'room_status', rr.room_status,
          'check_in_date', rr.check_in_date, 
          'check_out_date', rr.check_out_date
        )
      ) AS detail_reservations 
      FROM reservations r 
      JOIN guests g ON r.guest_id = g.id 
      LEFT JOIN reservation_rooms rr ON r.id = rr.reservation_id 
      WHERE r.id = ?
      GROUP BY r.id, r.reservation_code, r.guest_id, g.name, r.status
    `;
    const [rows] = await db.query(query, [reservationId]);
    return rows[0];
  },

  // UPDATE ubah Penanggung Jawab Reservasi (Guest)
  updateGuestOfReservation: async (reservationId, newGuestId) => {
    const [result] = await db.execute(
      `UPDATE reservations SET guest_id = ? WHERE id = ?`,
      [newGuestId, reservationId]
    );
    return result.affectedRows;
  }
};

module.exports = reservationModel;