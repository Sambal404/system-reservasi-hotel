-- view untuk digunakan login

CREATE VIEW vw_account AS
SELECT
    u.username,
    u.password,
    e.status as employee_status,
    a.name as application_name,
    au.role as application_role

FROM users u
JOIN employees e
    ON u.employee_id = e.id
JOIN application_users au
    ON au.user_id = u.id
JOIN applications a
    ON au.application_id = a.id;
    
-- DONE FINAL