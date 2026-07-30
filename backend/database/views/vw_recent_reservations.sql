-- Digunakan untuk Dashboard

use hotel_db;

CREATE OR REPLACE VIEW vw_recent_summary.sql AS
SELECT 
    r.reservation_code,
    g.name AS guest_name,
    MIN(rr.check_in_date) AS check_in_date,
    MAX(rr.check_out_date) AS check_out_date,
    r.status,
    r.created_at
FROM reservations r
JOIN guests g ON r.guest_id = g.id
JOIN reservation_rooms rr ON r.id = rr.reservation_id
GROUP BY 
    r.id, 
    r.reservation_code, 
    g.name, 
    r.status, 
    r.created_at
ORDER BY r.created_at DESC
LIMIT 25;