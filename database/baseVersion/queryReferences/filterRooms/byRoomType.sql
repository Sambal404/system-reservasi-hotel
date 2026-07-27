-- READ: Ambil tampil data Kamar berdasarkan tipe atau kelas
SELECT 
    r.id AS room_id,
    r.room_number,
    rt.name AS room_type_name, -- Diambil dari tabel room_types
    rt.base_price AS price_per_night, -- Diambil dari table room_types
    r.status,
    r.clean_status
FROM rooms r
JOIN room_types rt ON r.room_type_id = rt.id
WHERE rt.name = ?
ORDER BY r.room_number ASC
LIMIT ? OFFSET ?; -- LIMIT ?jumlahrow OFFSET ?skiprow (pagination)