
const pool = require ("../../config/db");

//validasi pembuatan tamu
const validateGuestCreate = async (req, res, next) => {
    try{
        //masukkin tabel tamu dari database atau pool
        const {name, gender, identity_type, identity_number, phone, email} = req.body;

        //validasi field wajib
        if(!name || !gender || !identity_type || !identity_number || !phone) {
            return res.status(400).json({message: "Nama, Gender, Tipe Identitas, Nomor Identitas, dan Nomor Telepon wajib diisi!"});
        }

        //validasi yang sesuai yang ada dipilihan 
        if (!["identity_card", "passport"].includes(identity_type)){
            return res.status(400).json({message: "Tipe Identitas harus Identity Card atau Passport"});
        }
        if (gender && !['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Jenis kelamin harus male atau female' });
    }

        //validasi format email
        if (email && !/^\S+@\S+\.\S+$/.test(email)){
            return res.status(404).json({message: "Format Email tidak valid"});
        }

        //input data tamu
        const [result] = await pool.execute(
            `INSERT INTO guests (name, gender, identity_type, identity_number, phone, email) VALUES (?,?,?,?,?,?)`,
            [name, gender, identity_type, identity_number, phone, email || null]
        );

        res.status(201).json({ id: result.insertId, name, gender, identity_type, identity_number, phone, email});

    }catch (err){
        //bakalan error kalau ternyata ada keduplikatan nomor identitas dan nomor telepon
        if (err.code === "ER_DUP_ENTRY"){
            if (err.message.includes("identity_number")){
                return res.status(409).json ({message: "Nomor Identitas sudah terdaftar"})
            }
            if (err.message.includes("phone")){
            return res.status(409).json ({message: "Nomor Telepon sudah terdaftar"});
        }
        return res.status(409).json({message: "Data sudah terdaftar"})
    }
        next(err);
    }
};

//validasi pembaruan data tamu
const validateGuestUpdate = async(req, res, next) => {
    try{
        const { name, gender, identity_type, identity_number, email, phone } = req.body;
        const {id} = req.params;

        //validasi nama kalau gaboleh kosong
        if (name !== undefined && name.trim() === ""){
            return res.status(400).json({message: "Nama tidak boleh kosong"});
        }

        //validasi nomor telepon kalau gaboleh kosong
        if(phone !== undefined && phone.trim() === ""){
            return res.status(400).json({message: "Nomor Telepon tidak boleh kosong"});
        }

        if(gender && !["male", "female"].includes(gender)){
            return res.status(400).json({message: "Jenis Kelamin harus male atau female"});
        }
        
        if(email && !/^\S+@\S+\.\S+$/.test(email)){
            return res.status(400).json({message: "Format Email tidak valid"});
        }
        

        //cek keduplikatan nomor identitas, kecuali punya sendiri
        if(identity_number){
            const [existing] = await pool.execute(
                "SELECT id FROM guests WHERE identity_number = ? AND id != ?",
                [identity_number, id]
            );
            if(existing.length > 0){
                return res.status(400).json({message: "Nomor Identitas sudah pernah terdaftar"});
            }
        }

        //cek duplikatan nomor telepon, kecuali punya sendiri
        if (phone){
            const [existingPhone] = await pool.execute(
                "SELECT id FROM guests WHERE phone = ? AND id != ?",
                [phone, id]
            );
            if(existingPhone.length > 0){
                return res.status(400).json({message: "Nomor Telepon sudah pernah terdaftar"});
            }
        }
        next();

    }catch (err){
        next(err);
    }
};


module.exports = {
    validateGuestCreate,
    validateGuestUpdate
}