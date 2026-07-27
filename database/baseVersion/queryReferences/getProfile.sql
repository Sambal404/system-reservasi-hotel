-- READ: Ambil tampil data profile user
SELECT 
    u.id AS user_id,
    u.username,
    u.role,
    e.employee_code,
    e.name AS employee_name,
    p.name AS position_name
FROM users u
JOIN employees e ON u.employee_id = e.id
JOIN positions p ON e.position_id = p.id
WHERE u.id = ?;