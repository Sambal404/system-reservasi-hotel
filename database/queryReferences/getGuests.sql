-- READ: tampil data Tamu
SELECT 
    id AS guest_id,
    name,
    identity_number,
    phone,
    email,
    created_at
FROM guests
ORDER BY name ASC
LIMIT ? OFFSET ?; -- LIMIT ?jumlahrow OFFSET ?skiprow (pagination)