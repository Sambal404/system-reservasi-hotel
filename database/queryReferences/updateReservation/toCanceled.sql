-- UPDATE: Reservasi dibatalkan, kamar tersedia dan masih bersih

-- Query 1: Ubah status reservasi jadi CANCELLED
UPDATE reservations 
SET 
    status = 'CANCELLED', 
    updated_at = CURRENT_TIMESTAMP 
WHERE id = ?;

-- Query 2: Pastikan status fisik kamar kembali AVAILABLE
UPDATE rooms 
SET status = 'AVAILABLE' 
WHERE id = (SELECT room_id FROM reservations WHERE id = ?);