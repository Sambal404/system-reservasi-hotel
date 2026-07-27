-- READ/SEARCH: Cari Kamar
SELECT 
    r.id AS room_id,
    r.room_number,
    rt.name AS room_type_name, -- Diambil dari table room_types
    rt.base_price AS price_per_night, -- Diambil dari table room_types
    r.status,
    r.clean_status
FROM rooms r
JOIN room_types rt ON r.room_type_id = rt.id
WHERE r.room_number LIKE CONCAT('%', ?, '%')
   OR rt.name LIKE CONCAT('%', ?, '%');