// /src/models/roomModel.js

const db = require('../config/db');

const roomModel = {
  // Ambil data rooms (status logic bisa digunakan untuk prediksi masa depan)
  getAllRooms : async ({ status, roomTypeId, search, date }) => {
    // jika tanggal tidak dimasukan akan memasukan tanggal hari ini
    const targetDate = date || new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        r.id, 
        r.room_number, 
        r.room_type_id, 
        rt.name AS room_type_name, 
        rt.base_price, 
        r.clean_status, -- Kebersihan Fisik ('clean' / 'dirty') Hari Ini
        
        -- Dynamic Operational Status
        CASE 
          WHEN r.status = 'maintenance' THEN 'maintenance'

          WHEN MAX(
            CASE 
              WHEN rr.room_status = 'checked_in' 
                  AND CURDATE() >= rr.check_in_date 
                  AND CURDATE() < rr.check_out_date THEN 1 
              ELSE 0 
            END
          ) = 1 THEN 'occupied'

          WHEN MAX(
            CASE 
              WHEN rr.room_status = 'booked' 
                  AND CURDATE() >= rr.check_in_date 
                  AND CURDATE() < rr.check_out_date THEN 1 
              ELSE 0 
            END
          ) = 1 THEN 'reserved'

          ELSE 'available'
        END AS room_status

      FROM rooms r 
      JOIN room_types rt ON r.room_type_id = rt.id 
      LEFT JOIN reservation_rooms rr 
        ON r.id = rr.room_id 
        AND rr.room_status IN ('booked', 'checked_in')
      WHERE 1 = 1 -- placeholder
    `;

    const params = [targetDate, targetDate, targetDate, targetDate];

    // Filter Search by room_type
    if (roomTypeId) {
      query += " AND r.room_type_id = ?";
      params.push(roomTypeId);
    }

    // Search by room_number
    if (search) {
      query += " AND (r.room_number LIKE ? OR rt.name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " GROUP BY r.id, r.room_number, r.room_type_id, rt.name, rt.base_price, r.clean_status, r.status";

    // Filter Search by status
    if (status) {
      // GENIUS ** ...semoga gak jadi berat
      query = `SELECT * FROM (${query}) AS room_list WHERE room_status = ?`;
      params.push(status);
    } else {
      query += " ORDER BY r.room_number ASC";
    }

    const [rows] = await db.execute(query, params);
    return rows;
  },


  // Cari kamar yang tersedia
  getAvailableRooms : async ({ checkInDate, checkOutDate, roomTypeId }) => {
    let query = `
      SELECT 
        r.id AS room_id, 
        r.room_number, 
        r.room_type_id, 
        rt.name AS room_type_name
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status = 'available'
        AND r.id NOT IN (
          SELECT rr.room_id 
          FROM reservation_rooms rr
          WHERE rr.room_id IS NOT NULL
            AND rr.room_status IN ('booked', 'checked_in')
            AND (? < rr.check_out_date AND ? > rr.check_in_date)
        )
    `;

    const params = [checkInDate, checkOutDate];

    // Filter room_type
    if (roomTypeId) {
      query += " AND r.room_type_id = ?";
      params.push(roomTypeId);
    }
    
    //Debug
    // console.log(query);
    // Ternyata cuma lupa sepasi habis petik T~T'
    query += " ORDER BY r.room_number ASC";

    const [rows] = await db.execute(query, params);
    return rows;
  },


  // Special untuk mencari kamar tersedia hari ini
  getAvailableRoomsToday : async ({ roomTypeId }) => {
    // Data hari ini 2026-08-02T19:13:22.162Z potong di T ambil yang kiri
    const today = new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        r.id AS room_id, 
        r.room_number, 
        r.room_type_id, 
        rt.name AS room_type_name,
        r.clean_status
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status = 'available'
        AND r.clean_status = 'clean' -- Wajib bersih untuk dikonsumsi hari ini
        AND r.id NOT IN (
          SELECT rr.room_id 
          FROM reservation_rooms rr
          WHERE rr.room_id IS NOT NULL
            AND rr.room_status IN ('booked', 'checked_in')
            AND (? >= rr.check_in_date AND ? < rr.check_out_date)
        )
    `;

    const params = [today, today];

    // Filter Search room_type
    if (roomTypeId) {
      query += " AND r.room_type_id = ?";
      params.push(roomTypeId);
    }

    query += " ORDER BY r.room_number ASC";

    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Get Detail Kamar + Facilities
  getRoomById : async (id) => {
    const [rows] = await db.execute(
      `SELECT 
        r.id, 
        r.room_number, 
        r.status, 
        r.clean_status,
        r.room_type_id, 
        rt.name AS room_type_name, 
        rt.base_price, 
        rt.description AS room_type_description 
      FROM rooms r 
      JOIN room_types rt ON r.room_type_id = rt.id 
      WHERE r.id = ?`,
      [id]
    );

    if (!rows[0]) return null;

    const [amenities] = await db.execute(
      `SELECT a.id, a.name, a.icon, a.description 
      FROM amenities a
      JOIN room_type_amenities rta ON a.id = rta.amenity_id
      WHERE rta.room_type_id = ?`,
      [rows[0].room_type_id]
    );

    return {
      ...rows[0],
      amenities: amenities || []
    };
  }
};

module.exports = roomModel;