-- View untuk menampilakn room status real time

CREATE VIEW vw_room_monitoring AS
SELECT
    r.id,
    r.room_number,
    rt.name AS room_type,
    rt.base_price,
    r.clean_status,

    CASE
        WHEN r.status = 'maintenance' THEN 'maintenance'

        WHEN EXISTS (
            SELECT 1 from reservation_rooms rr
            WHERE rr.room_id = r.id
                AND rr.status = 'checked_in'
        ) THEN 'occupied'

        WHEN EXISTS (
            SELECT 1
            FROM reservation_rooms rr
            WHERE rr.room_id = r.id
                AND rr.status = 'booked'
                AND CURDATE() BETWEEN rr.check_in AND DATE_SUB(rr.check_out, INTERVAL 1 DAY)
        ) THEN 'reserved'

        ELSE 'available'
    END AS room_status
FROM rooms r
JOIN room_types rt
ON rt.id = r.room_type_id;

-- DONE!