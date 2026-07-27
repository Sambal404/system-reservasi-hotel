-- menampilkan ruangan yang tersedia

CREATE VIEW vw_available_rooms AS
SELECT 
    r.id,
    r.room_number,
    rt.name AS room_type,
    rt.base_price,
    r.extension_phone
FROM rooms r
JOIN room_types rt 
    ON rt.id = r.room_type_id
WHERE r.status = 'available'
  AND r.clean_status = 'clean'
  -- exclude kamar tidak sedang dibooking atau di-check-in orang lain
  AND NOT EXISTS (
      SELECT 1 FROM reservation_rooms rr
      WHERE rr.room_id = r.id
        AND rr.status IN ('booked', 'checked_in')
        AND CURDATE() < rr.check_out -- Belum lewat tanggal checkout
  );