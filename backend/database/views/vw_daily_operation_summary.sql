-- Digunakan untuk dashboard

use hotel_db;

CREATE OR REPLACE VIEW vw_daily_operation_summary.sql AS
SELECT    
    (SELECT COUNT(*) FROM reservations WHERE DATE(created_at) = CURDATE()) AS reservations_created_today,     
    (SELECT COUNT(*) FROM reservation_rooms WHERE check_in_date = CURDATE() AND room_status = 'booked') AS expected_checkin,     
    (SELECT COUNT(*) FROM reservation_rooms WHERE check_out_date = CURDATE() AND room_status = 'checked_in') AS expected_checkout,     
    (SELECT COUNT(*) FROM reservation_rooms WHERE room_status = 'booked') AS total_future_reservations;
