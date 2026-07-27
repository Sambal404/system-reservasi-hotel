-- view untuk guests table

CREATE VIEW vw_guest AS
SELECT
    id,
    name,
    phone,
    email,
    identity_id_masked as identity_id
FROM guests;