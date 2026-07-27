-- view tampilan reservations table yang lebih rapih

CREATE VIEW vw_reservation AS
SELECT 
    rsv.id,
    rsv.reservation_code,
    g.name AS guest_name,
    rr.room_id,
    r.room_number,
    rt.name AS room_type,
    rr.check_in,
    rr.check_out,
    rr.status AS room_status,

    