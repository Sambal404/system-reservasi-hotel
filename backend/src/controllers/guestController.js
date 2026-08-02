// /src/controllers/guestControllers

const pool = require("../config/db");

//get/api/guest
const getGuest = async (req, res, next) =>{
    try {
        const [rows] = await pool.execute("SELECT * FROM guests ORDER BY id DESC");

        // Debug 
        res.json({
            success: true,
            data: rows
        });
    }catch (err) { 
        next (err);
    }
};

//get/api/guest/id
const getGuestById = async (req, res, next) =>{
    try{
        const id = parseInt(req.params.id, 10);
        const [rows] = await pool.execute("SELECT * FROM guests WHERE id = ?", [id]);
        if(rows.length === 0 ) return res.status(404).json({message: "Data Tamu tidak ditemukan"});
        res.json(rows[0]);
    } catch (err) {
        next (err);
    }
};

//post/api/guest (protected)
const createGuest = async (req, res, next) =>{
    try{
        const {name, gender, identity_type, identity_number, phone, email} = req.body;
        const [result] = await pool.execute(
            "INSERT INTO guests (name, gender, identity_type, identity_number, phone, email) values (?, ?, ?, ?, ?, ?) ", [name, gender, identity_type, identity_number, phone, email || null]
        );
        res.status(201).json({ id: result.insertId, name, gender, identity_type, identity_number, phone, email});
    } catch (err){
        next(err);
    }
};

//put/api/guest/id (protected)
const updateGuest = async(req, res, next) =>{
    try {
        const id = parseInt(req.params.id, 10);
        const {name, gender, identity_type, identity_number, phone, email} = req.body;

        //build dynamic update (simple)
        const fields = [];
        const values = [];
        if ( name !== undefined) {fields.push("name=?"); values.push(name); }
        if ( gender !== undefined) {fields.push("gender=?"); values.push(gender); }
        if ( identity_type !== undefined) {fields.push("identity_type=?"); values.push(identity_type); }
        if ( identity_number !== undefined) {fields.push("identity_number=?"); values.push(identity_number); }
        if ( phone !== undefined) {fields.push("phone=?"); values.push(phone); }
        if ( email !== undefined) {fields.push("email=?"); values.push(email); }

        if (fields.length === 0 ) return res.status(400).json({message: "Tidak ada yang diupdate"});

        values.push(id);
        const sql = `UPDATE guests SET ${fields.join(",")} WHERE id = ?`;
        const [result] = await pool.execute(sql, values);

        if (result.affectedRows === 0) return res.status (404).json({message: "Tidak ada data tamu"});
        res.json({message: "Data tamu berhasil diperbaharui!"});
    }catch (err){
        next(err);
    }
};

//delete/api/guest/id (protected)
    const deleteGuest = async (req,res,next)=>{
        try{
            const id = parseInt(req.params.id, 10);
            const [result] = await pool.execute("DELETE FROM guests WHERE id = ?", [id]);
            if (result.affectedRows === 0) return res.status(401).json({message: "Tidak ada data tamu"});
            res.json({message: "Data tamu berhasil dihapus"});
        }catch (err){
            next (err);
        };
    };

    module.exports = { getGuest, getGuestById, createGuest, updateGuest, deleteGuest};
