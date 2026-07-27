-- UPDATE: Receptionist atau FrontOffice Staff mengganti kamar, entah karna apa
-- atau baiknya nambah reservasi baru? ribet
UPDATE reservations 
SET 
    room_id = ?,          -- bisa pindah kamar jika belum checkin atau ada masalah dengan kamar
    check_in_date = ?, 
    check_out_date = ?, 
    total_price = ?,
    updated_at = CURRENT_TIMESTAMP 
WHERE id = ? AND status = 'BOOKED';