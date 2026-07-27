-- READ: Ambil tampil data reservasi yang berstatus cancelled saja. cancelled L nya 2 atau 1? di init 2
SELECT 
    r.id AS reservation_id,
    g.name AS guest_name,
    rm.room_number,
    rt.name AS room_type,
    r.check_in_date,
    r.check_out_date,
    r.total_price,
    r.payment_status,
    r.status,
    r.updated_at AS canceled_at
FROM reservations r
JOIN guests g ON r.guest_id = g.id
JOIN rooms rm ON r.room_id = rm.id
JOIN room_types rt ON rm.room_type_id = rt.id
WHERE r.status = 'CANCELED' -- L nya satu yang bener, yang 2 english british
ORDER BY r.updated_at DESC
LIMIT ? OFFSET ?;