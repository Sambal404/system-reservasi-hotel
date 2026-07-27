-- view untuk rooms table

CREATE VIEW vw_room AS
SELECT 
    r.id,
    r.room_number,
    rt.name as room_type,
    rt.base_price,
    r.status,
    r.clean_status

FROM rooms r
JOIN room_types rt
    ON rt.id = r.room_type_id;