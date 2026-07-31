-- Digunakan untuk Dashboard

use hotel_db;

CREATE OR REPLACE VIEW vw_room_status_summary AS
SELECT 
    COUNT(*) AS total_rooms,
    -- SUM( status benar? bernilai satu, salah? bernilai 0);
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_rooms,
    SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied_rooms,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_rooms
FROM rooms;