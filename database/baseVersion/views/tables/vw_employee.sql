-- view untuk menampilkan employees table, bisa digunakan untuk profile

CREATE VIEW vw_employee AS
SELECT
    e.id,
    e.employee_code,
    e.name,
    e.email,
    e.phone,
    e.status,
    p.name as position_name

FROM employees e
JOIN positions p
    ON p.id = e.position_id;