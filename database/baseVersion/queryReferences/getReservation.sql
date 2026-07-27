-- READ: Ambil tampil data reservasi
SELECT 
    r.id AS reservation_id,
    g.name AS guest_name,
    g.identity_number AS guest_nik,
    rm.room_number,
    rt.name AS room_type,
    u.username AS handled_by,
    r.check_in_date,
    r.check_out_date,
    r.total_price,
    r.payment_status, -- I am dying just for this sh**
    r.status,
    r.created_at
FROM reservations r
JOIN guests g ON r.guest_id = g.id
JOIN rooms rm ON r.room_id = rm.id
JOIN room_types rt ON rm.room_type_id = rt.id
JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT ? OFFSET ?;