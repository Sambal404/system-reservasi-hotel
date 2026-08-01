const db = require('../config/db');

// Get All Reservation Rooms
const getAllReservationRoomsDb = async () => {
    const [rows] = await db.query(`
        SELECT 
            r.id AS reservation_id,
            rr.id AS reservation_room_id,
            r.reservation_code,
            rr.room_type_id,
            rr.room_id,
            rr.room_status,
            rr.price_per_night,
            rr.check_in_date,
            rr.check_out_date,
            rr.checked_in_at,
            rr.checked_out_at
        FROM reservation_rooms rr
        JOIN reservations r ON rr.reservation_id = r.id
    `);
    return rows;
};

// Check-in
const checkInRoomDb = async (reservationRoomId, userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [roomDetail] = await connection.query(
            `SELECT reservation_id, room_id, room_status FROM reservation_rooms WHERE id = ? FOR UPDATE`,
            [reservationRoomId]
        );

        if (roomDetail.length === 0) {
            throw new Error('Data kamar reservasi tidak ditemukan.');
        }

        const { reservation_id, room_id, room_status } = roomDetail[0];

        if (room_status !== 'booked') {
            throw new Error('Kamar tidak dalam status booked.');
        }

        if (!room_id) {
            throw new Error('Nomor kamar fisik (room_id) belum ditentukan, tidak dapat melakukan check-in.');
        }

        // Update status reservation_room jadi checked_in
        const [updateResRoom] = await connection.query(
            `UPDATE reservation_rooms 
             SET room_status = 'checked_in', 
                 checked_in_at = NOW(), 
                 checked_in_by = ? 
             WHERE id = ?`,
            [userId, reservationRoomId]
        );

        if (updateResRoom.affectedRows === 0) {
            throw new Error('Gagal memperbarui status kamar reservasi.');
        }

        // Update status reservations utama menjadi 'active'
        await connection.query(
            `UPDATE reservations SET status = 'active' WHERE id = ?`,
            [reservation_id]
        );

        // Update status fisik rooms menjadi 'occupied'
        await connection.query(
            `UPDATE rooms SET status = 'occupied' WHERE id = ?`,
            [room_id]
        );

        await connection.commit();
        connection.release();
        return true;

    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
};

// Check-out (Updated with Transaction & Automatic Completed Check)
const checkOutRoomDb = async (reservationRoomId, userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [roomDetail] = await connection.query(
            `SELECT reservation_id, room_id, room_status FROM reservation_rooms WHERE id = ? FOR UPDATE`,
            [reservationRoomId]
        );

        if (roomDetail.length === 0) {
            throw new Error('Data kamar reservasi tidak ditemukan.');
        }

        const { reservation_id, room_id, room_status } = roomDetail[0];

        if (room_status !== 'checked_in') {
            throw new Error('Kamar belum dalam status checked_in.');
        }

        // Update status reservation_room jadi checked_out
        await connection.query(
            `UPDATE reservation_rooms 
             SET room_status = 'checked_out', 
                 checked_out_at = NOW(), 
                 checked_out_by = ? 
             WHERE id = ?`,
            [userId, reservationRoomId]
        );

        // Update status fisik rooms menjadi 'available' dan clean_status menjadi 'dirty'
        if (room_id) {
            await connection.query(
                `UPDATE rooms SET status = 'available' clean_status = 'dirty' WHERE id = ?`,
                [room_id]
            );
        }

        // Cek apakah semua kamar pada reservation_id ini sudah checked_out (atau canceled)
        const [remainingRooms] = await connection.query(
            `SELECT COUNT(*) AS active_count 
             FROM reservation_rooms 
             WHERE reservation_id = ? AND room_status NOT IN ('checked_out', 'canceled')`,
            [reservation_id]
        );

        // Jika sisa kamar aktif = 0, ubah status reservations utama menjadi 'completed'
        if (remainingRooms[0].active_count === 0) {
            await connection.query(
                `UPDATE reservations SET status = 'completed' WHERE id = ?`,
                [reservation_id]
            );
        }

        await connection.commit();
        connection.release();
        return true;

    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
};

// Update Detail Reservation Room
const updateReservationRoomById = async (reservationRoomId, data) => {
    const { room_type_id, room_id, check_in_date, check_out_date, total_adults, total_children } = data;
    const [result] = await db.query(
        `UPDATE reservation_rooms 
         SET room_type_id = ?, 
             room_id = ?, 
             check_in_date = ?, 
             check_out_date = ?, 
             total_adults = ?, 
             total_children = ? 
         WHERE id = ?`,
        [room_type_id, room_id || null, check_in_date, check_out_date, total_adults, total_children, reservationRoomId]
    );
    return result.affectedRows;
};

module.exports = {
    getAllReservationRoomsDb,
    checkInRoomDb,
    checkOutRoomDb,
    updateReservationRoomById
};