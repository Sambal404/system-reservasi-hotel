// /src/models/authModel.js

const db = require("../config/db");

const authModel = {
  findUserForLogin: async (username, applicationName) => {
    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.password AS hashed_password,
        u.is_active AS is_user_active,
        e.id AS employee_id,
        e.full_name,
        e.email,
        e.position_id,
        p.name AS position_name,
        app.id AS application_id,
        app.name AS application_name,
        au.role
      FROM users u
      JOIN employees e ON u.employee_id = e.id
      JOIN positions p ON e.position_id = p.id
      JOIN application_users au ON u.id = au.user_id
      JOIN applications app ON au.application_id = app.id
      WHERE
        u.username = ? AND
        app.name = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [username, applicationName]);
    return rows[0] || null;
  },

  // update status user True sedang online, false sedang offline
  updateUserActiveStatus: async (userId, status) => {
    const query = `
      UPDATE users 
      SET is_active = ? 
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [status, userId]);
    return result.affectedRows;
  },

  // Ambil data profile user
  findUserById: async (userId) => {
    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.is_active,
        e.id AS employee_id,
        e.employee_code,
        e.full_name,
        e.phone,
        e.email,
        p.name AS employee_position,
        au.role
      FROM users u
      JOIN employees e ON u.employee_id = e.id
      JOIN positions p ON e.position_id = p.id
      JOIN application_users au ON u.id = au.user_id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows[0] || null;
  },
};

module.exports = authModel;