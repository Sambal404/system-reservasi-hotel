-- data untuk tampilan dashboard summary dari status kamar saat ini
-- mengmbalikan nilai jumlah

CREATE VIEW vw_room_summary AS
SELECT
    COUNT(*) AS total_rooms,
    SUM(CASE WHEN room_status = 'reserved' THEN 1 ELSE 0 END) AS reserved_rooms,
    SUM(CASE WHEN room_status = 'available' THEN 1 ELSE 0 END) AS available_rooms,
    SUM(CASE WHEN room_status = 'occupied' THEN 1 ELSE 0 END) AS occupied_rooms,
    SUM(CASE WHEN room_status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_rooms

FROM vw_room_monitoring;

-- batalkan, view untuk view bisa menurunkan performa. pindahkan logika summary ke backend
    