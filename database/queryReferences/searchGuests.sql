-- READ/SEARCH: cari tamu
SELECT 
    id AS guest_id,
    name,
    identity_number,
    phone,
    email
FROM guests
WHERE identity_number LIKE CONCAT('%', ?, '%')
   OR name LIKE CONCAT('%', ?, '%')
   OR phone LIKE CONCAT('%', ?, '%');