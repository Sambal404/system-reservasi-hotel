// /src/models/reservationRoomModel.js
const db = require('../config/db');


// ambil semua data reservasi dalam table
const getAllReservationRooms = async ({ roomStatus, searchRoomNumber, limit = 20, offset = 0 } = {}) => {
    let query = `
        SELECT 
            r.id AS reservation_id, 
            rr.id AS reservation_room_id, 
            r.reservation_code, 
            rm.room_number, 
            rt.name AS room_type_name,
            rr.room_status, 
            rr.price_per_night, 
            rr.check_in_date, 
            rr.check_out_date, 
            rr.checked_in_at, 
            rr.checked_out_at 
        FROM reservation_rooms rr 
        JOIN reservations r ON rr.reservation_id = r.id
        LEFT JOIN rooms rm ON rr.room_id = rm.id
        LEFT JOIN room_types rt ON rr.room_type_id = rt.id
        WHERE 1=1
    `;
  
    const queryParams = [];
  
    // Filter berdasarkan Status Kamar Reservasi
    if (roomStatus) {
      query += ` AND rr.room_status = ?`;
      queryParams.push(roomStatus);
    }
  
    // Filter berdasarkan Nomor Kamar Fisik
    if (searchRoomNumber) {
      query += ` AND rm.room_number LIKE ?`;
      queryParams.push(`%${searchRoomNumber}%`);
    }
  
    query += ` ORDER BY rr.check_in_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));
  
    const [rows] = await db.query(query, queryParams);
  
    return rows;
};

// Check In
const checkInRoom = async (reservationRoomId, roomId, userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [rr] = await connection.execute(
            `SELECT reservation_id 
            FROM reservation_rooms 
            WHERE id = ? FOR UPDATE`,
            [reservationRoomId]
        );
        const reservationId = rr[0]?.reservation_id;

        // Update status ke checked_in masukan kamar yang dipilih dan record staff
        await connection.execute(
            `UPDATE reservation_rooms 
             SET
                room_status = 'checked_in',
                room_id = ?, checked_in_at = NOW(),
                check_in_by = ? 
             WHERE id = ?`,
            [roomId, userId, reservationRoomId]
        );

        // Update status kamar menjadi occupied
        await connection.execute(
            `UPDATE rooms
            SET status = 'occupied' 
            WHERE id = ?`,
            [roomId]
        );

        // Update status reservation menjadi active
        await connection.execute(
            `Update reservations 
            SET status = 'active' 
            WHERE id = ? 
            AND status = 'confirmed'`,
            [reservationId]
            )

        await connection.commit();
        return true;
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Check Out
const checkOutRoom = async (reservationRoomId, userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Dapatkan room_id (lebih aman begini, mencegah kesalahan data dibanding langsung room_id)
        const [rr] = await connection.execute(
            `SELECT room_id, reservation_id
            FROM reservation_rooms 
            WHERE id = ? FOR UPDATE`, 
            [reservationRoomId]
        );
        const roomId = rr[0]?.room_id;
        const reservationId = rr[0].reservation_id;

        // Update status kamar menjadi 'check_out'
        await connection.execute(
            `UPDATE reservation_rooms 
             SET room_status = 'checked_out', 
             checked_out_at = NOW(), 
             check_out_by = ? 
             WHERE id = ?`,
            [userId, reservationRoomId]
        );

        // Update status fisik kamar menjadi 'dirty' (kotor, butuh dibersihkan Housekeeping)
        if (roomId) {
            await connection.execute(
                `UPDATE rooms SET 
                status = 'available', 
                clean_status = 'dirty' 
                WHERE id = ?`,
                [roomId]
            );
        }
        
        // Update reservasi menjadi completed jika semua kamar di reservasi sudah check out
        if (reservationId) {
            const [activeRooms] = await connection.execute(
                `SELECT COUNT(*) AS count 
                 FROM reservation_rooms 
                 WHERE 
                    reservation_id = ? 
                    AND room_status IN ('booked', 'checked_in')`,
                [reservationId]
            );

            // Jika count === 0, berarti seluruh kamar sudah check-out / cancel -> ubah induk jadi 'completed'
            if (activeRooms[0].count === 0) {
                await connection.execute(
                    `UPDATE reservations
                    SET status = 'completed' 
                    WHERE id = ?`,
                    [reservationId]
                );
            }
        }

        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateReservationRoomById = async (reservationRoomId, data) => {
    const { room_type_id, room_id, check_in_date, check_out_date, total_adults, total_children } = data;
    
    const [result] = await db.query(
        `UPDATE reservation_rooms 
         SET 
            room_type_id = ?, 
            room_id = ?, 
            check_in_date = ?, 
            check_out_date = ?, 
            total_adults = ?, 
            total_children = ? 
         WHERE id = ?`,
        [
            room_type_id,
            room_id || null,
            check_in_date,
            check_out_date,
            total_adults,
            total_children,
            reservationRoomId
        ]
    );
    return result.affectedRows;
};

// CREATE: Menambahkan kamar baru ke dalam reservasi yang sudah ada
const addRoomToReservation = async (data) => {
    const { reservation_id, room_type_id, room_id, price_per_night, check_in_date, check_out_date, total_adults, total_children } = data;
    
    // Status otomatis 'booked' saat baru dibuat
    const [result] = await db.query(
        `INSERT INTO reservation_rooms 
            (
            reservation_id, 
            room_type_id,
            room_id, 
            price_per_night, 
            check_in_date, 
            check_out_date, 
            total_adults, 
            total_children, 
            room_status
            ) 
         VALUES 
            (
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            'booked')`,
        [
            reservation_id, 
            room_type_id, 
            room_id || null, 
            price_per_night, 
            check_in_date, 
            check_out_date, 
            total_adults || 1, 
            total_children || 0
        ]
    );
    return result.insertId;
};

// Soft Delete (Membatalkan)
const cancelReservationRoomById = async (reservationRoomId) => {
    const [result] = await db.query(
        `UPDATE reservation_rooms 
        SET room_status = 'canceled' 
        WHERE id = ?`,
        [reservationRoomId]
    );
    return result.affectedRows;
};

module.exports = {
    getAllReservationRooms,
    checkInRoom,
    checkOutRoom,
    updateReservationRoomById,
    addRoomToReservation,
    cancelReservationRoomById
};