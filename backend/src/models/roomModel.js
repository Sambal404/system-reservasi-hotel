const db = require("../config/db");

const getAllRooms = async ({ status, roomTypeId, search }) => {
  let query = `
    SELECT
      r.id,
      r.room_number,
      r.status,
      r.room_type_id,
      rt.name AS room_type_name,
      rt.base_price,
      rt.description AS room_type_description
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE 1 = 1
  `;
  const params = [];

  if (status) {
    query += " AND r.status = ?";
    params.push(status);
  }

  if (roomTypeId) {
    query += " AND r.room_type_id = ?";
    params.push(roomTypeId);
  }

  if (search) {
    query += " AND (r.room_number LIKE ? OR rt.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY r.room_number ASC";
  const [rows] = await db.execute(query, params);
  return rows;
};

const getRoomById = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT
      r.id,
      r.room_number,
      r.status,
      r.room_type_id,
      rt.name AS room_type_name,
      rt.base_price,
      rt.description AS room_type_description
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.id = ?
  `,
    [id],
  );

  if (!rows[0]) return null;

  const [amenities] = await db.execute(
    `
    SELECT a.id, a.name, a.icon, a.description
    FROM room_type_amenities rta
    JOIN amenities a ON rta.amenity_id = a.id
    WHERE rta.room_type_id = ?
  `,
    [rows[0].room_type_id],
  );

  return {
    ...rows[0],
    amenities,
  };
};

module.exports.default = {
  getAllRooms,
  getRoomById,
};
