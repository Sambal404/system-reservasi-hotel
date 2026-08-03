const db = require('../config/db');

const guestModel = {
    getAllGuests : async ({ search, limit = 20, offset = 0 } = {}) => {
        let query = 'SELECT * FROM guests';
        let statsQuery = `
            SELECT 
            COUNT(*) AS total,
            CAST(SUM(CASE WHEN gender IN ('male') THEN 1 ELSE 0 END) AS UNSIGNED) AS male_count,
            CAST(SUM(CASE WHEN gender IN ('female') THEN 1 ELSE 0 END) AS UNSIGNED) AS female_count
            FROM guests;
        `;
        
        // parameters
        const params = [];
        
        // Filter Search
        if (search) {
            const searchFilter = ' WHERE name LIKE ? OR phone LIKE ? OR identity_number LIKE ?';
            query += searchFilter;
        
            const searchKeyword = `%${search}%`;
            params.push(searchKeyword, searchKeyword, searchKeyword);
        }

        // Pagination
        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        
        const [rows] = await db.execute(query, params);
        const [statsResult] = await db.execute(statsQuery);
        
        const { total = 0, male = 0, female = 0 } = statsResult[0] || {};
        
        return {
            rows,
            total,
            male,
            female,
        };
    },

    getGuestById : async (id) => {
        const [rows] = await db.execute('SELECT * FROM guests WHERE id = ?', [id]);
        return rows[0] || null;
    },

    createGuest : async (data) => {
        const { name, gender, identity_type, identity_number, phone, email } = data;
        const [result] = await db.execute(
            'INSERT INTO guests (name, gender, identity_type, identity_number, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
            [name, gender, identity_type, identity_number, phone, email || null]
        );

        return result.insertId;
    },

    updateGuest : async (id, data) => {
        const { name, gender, identity_type, identity_number, phone, email } = data;
        const [result] = await db.execute(
            'UPDATE guests SET name = ?, gender = ?, identity_type = ?, identity_number = ?, phone = ?, email = ? WHERE id = ?',
            [name, gender, identity_type, identity_number, phone, email || null, id]
        );

        return result.affectedRows;
    },
}

module.exports = guestModel;