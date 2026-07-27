-- view untuk payments table

CREATE VIEW vw_payment AS
SELECT
    p.id,
    p.amount,
    p.payment_method,
    p.payment_type,
    p.reference_number,
    g.name AS guest_name,
    p.created_at AS payment_date,
    r.reservation_code

FROM payments p
JOIN reservations r
    ON r.id = p.reservation_id
JOIN guests g
    ON g.id = r.guest_id;

-- DONE!
