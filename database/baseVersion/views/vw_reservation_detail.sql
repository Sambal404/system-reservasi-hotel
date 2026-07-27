-- view untuk menampilkan detail reservasi

CREATE VIEW vw_reservation_detail AS
SELECT
    rsv.id,
    rsv.reservation_code,
    g.name as guest_name,
    rm.room_number,
    rt.name as room_type,

    -- jadwal dari booking
    rr.check_in,
    rr.check_out,

    -- status reservasi dari ruangan, per ruangan
    rr.status as reservation_room_status,

    rsv.status as reservation_status,
    rsv.payment_status,
    rsv.total_price

FROM reservation rsv
JOIN guests g
ON g.id = rsv.guest_id
JOIN reservation_rooms rr
ON rr.reservation_id = rsv.id
JOIN rooms rm
ON 

-- ON GOING