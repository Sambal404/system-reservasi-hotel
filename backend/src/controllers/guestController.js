// /src/controllers/guestControllers

const guestModel = require('../models/guestModel');


// GET /api/guests?search=...&page=1&limit=20
const getGuest = async (req, res, next) =>{
    try {
        const { search } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = (page -1) * limit;

        const { rows, total, male, female } = await guestModel.getAllGuests({
            search,
            limit,
            offset
        })
        res.json({
            success: true,
            data: rows,
            summary: {
                total,
                male,
                female,
            }
        });
    }catch (err) { 
        next (err);
    }
};


// GET /api/guests/:id
const getGuestById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const guest = await guestModel.getGuestById(id);

    if (!guest) {
        return res.status(404).json({
            success: false,
            message: 'Data tamu tidak ditemukan',
        });
    }

    return res.json({
        success: true,
        data: guest,
    });
  } catch (err) {
    next(err);
  }
};


// POST /api/guest (protected)
const createGuest = async (req, res, next) => {
    try {
        const newGuestId = await guestModel.createGuest(req.body);
    
        return res.status(201).json({
            success: true,
            message: 'Berhasil menambahkan data tamu baru',
            data: {
            id: newGuestId,
            ...req.body,
            }
        });
    } catch (err) {
      next(err);
    }
};


// PUT /api/guest/:id (protected)
const updateGuest = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const affected = await guestModel.updateGuest(id, req.body);
  
      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Data tamu tidak ditemukan',
        });
      }
  
      return res.json({
        success: true,
        message: 'Berhasil memperbarui data tamu',
      });
    } catch (err) {
      next(err);
    }
};


// Delete /api/guest/id (protected)
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
