-- UPDATE: 

-- Query 1: Ubah status reservasi menjadi CHECKED_OUT & pasang payment_status = PAID
UPDATE reservations 
SET 
    status = 'CHECKED_OUT', 
    payment_status = 'PAID', -- wajib terkonfirmasi sudah bayar secara penuh. Ini masih yang versi lama sebelum ada table payment kan gak ada konfirmasi? harus gimana?
    updated_at = CURRENT_TIMESTAMP 
WHERE id = ? AND status = 'CHECKED_IN';

-- Query 2: Kembalikan status kamar jadi AVAILABLE dan clean_status jadi DIRTY
UPDATE rooms 
SET 
    status = 'AVAILABLE', 
    clean_status = 'DIRTY' -- Kamar Kotor habis dipakai otomatis, petugas Housekeeping bisa cek kalo masih bersih update jadi CLEAN
WHERE id = (SELECT room_id FROM reservations WHERE id = ?);