// /src/models/reservationModel.js

const db = require('../config/db');
const crypto = require('crypto');


  
const createReservation = async (guest_id, user_id, rooms) => {
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
            VALUES (?, ?, ?, 'pending', 'unpaid')`,
            [reservationCode, guest_id, user_id]
        );

        const reservationId = reservationResult.insertId; // Ambil reservasi id yang baru

    // Proses detail kamar (reservation_rooms)
    for (const item of rooms) {
        const { room_type_id, quantity, check_in_date, check_out_date } = item;

        // Ambil base_price dari table room_types untuk disimpan sebagai price_per_night
        const [roomTypeRows] = await connection.query(
            `SELECT base_price FROM room_types WHERE id = ? FOR UPDATE`,
            [room_type_id]
        );

        if (!roomTypeRows[0]) {
            throw new Error(`Tipe kamar dengan ID ${room_type_id} tidak ditemukan.`);
        }

        const pricePerNight = roomTypeRows[0].base_price;

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

        // Insert reservasi kamar satu persatu ke table reservation_rooms
        for (let i = 0; i < quantity; i++) {
            await connection.query(
                `INSERT INTO reservation_rooms (reservation_id, room_type_id, room_id, check_in_date, check_out_date, room_status, price_per_night) 
                VALUES (?, ?, NULL, ?, ?, 'booked', ?)`,
                [reservationId, room_type_id, check_in_date, check_out_date, pricePerNight]
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
}

const getReservations = async () => {
    const [rows] = await db.query(
        `SELECT 
        r.id AS reservation_id,
        r.reservation_code,
        r.guest_id,
        g.name AS guest_name,
        r.status,
        r.payment_status,
        r.total_price
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'room_type_id', rr.room_type_id,
                'room_type_name', rt.name,
                'room_id', rr.room_id,
                'room_number', rm.room_number,
                'price_per_night', rr.price_per_night,
                'total_adults', rr.total_adults,
                'total_children', rr.total_children
            )
        ) AS detail_reservations,
        r.user_id
        FROM reservations r
        JOIN guests g ON r.guest_id = g.id
        JOIN reservation_rooms rr ON r.id = rr.reservation_id
        JOIN room_types rt ON rr.room_type_id = rt.id
        LEFT JOIN rooms rm ON rr.room_id = rm.id
        GROUP BY 
        r.id, 
        r.reservation_code, 
        r.guest_id, 
        g.name, 
        r.user_id;`
    );
    return rows;
}

const getReservation = async (reservationId) => {
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
}

const updateReservationGuest = async (reservationId, newGuestId) => {
  const [result] = await db.query(
    `UPDATE reservations SET guest_id = ? WHERE id = ?`,
    [newGuestId, reservationId]
  );
  return result;
};

module.exports = {
  createReservation,
  getReservations,
  getReservation,
  updateReservationGuest
};