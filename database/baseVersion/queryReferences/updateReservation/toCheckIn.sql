-- UPDATE: Receptionist atau FrontOffice Staff konfirmasi checkin dan kasih kunci akses kamar ke tamu

-- Query 1: Ubah status reservasi menjadi CHECKED_OUT & pasang payment_status = PAID
UPDATE reservations 
SET 
    status = 'CHECKED_OUT', 
    payment_status = 'PAID', 
    updated_at = CURRENT_TIMESTAMP 
WHERE id = ? AND status = 'CHECKED_IN';

-- Query 2: Kembalikan status kamar jadi AVAILABLE dan clean_status jadi DIRTY
UPDATE rooms 
SET 
    status = 'AVAILABLE', 
    clean_status = 'DIRTY' 
WHERE id = (SELECT room_id FROM reservations WHERE id = ?);