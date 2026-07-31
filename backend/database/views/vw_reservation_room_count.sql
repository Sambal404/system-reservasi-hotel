SELECT 
    r.id AS reservation_id,
    r.reservation_code,
    r.guest_id,
    g.name AS guest_name,              -- Sesuaikan g.name jika di tabel guests memakai name
    r.status AS reservation_status,
    r.payment_status,
    e.full_name AS created_by_employee,     -- Nama pegawai/staf pembuat reservasi
    rr.room_status AS reservation_room_status,   -- Status per item kamar (misal: booked/checked_in)
    rt.name AS room_type_name,
    COUNT(rr.id) AS total_rooms
FROM reservation_rooms rr
JOIN reservations r ON rr.reservation_id = r.id
JOIN guests g ON r.guest_id = g.id
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN employees e ON u.employee_id = e.id
JOIN room_types rt ON rr.room_type_id = rt.id
GROUP BY 
    r.id,
    r.reservation_code,
    g.name,
    r.status,
    r.payment_status,
    e.full_name,
    rr.room_status,
    rr.room_type_id,
    rt.name;