
-- TRIGGER 1: Otomatis Kamar Kotor saat Check-Out

DELIMITER //

CREATE TRIGGER after_checkout
AFTER UPDATE ON reservation_rooms
FOR EACH ROW
BEGIN
    -- Jika status berubah menjadi 'checked_out'
    IF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
        -- Ubah status kebersihan kamar menjadi 'dirty'
        UPDATE rooms 
        SET clean_status = 'dirty' 
        WHERE id = NEW.room_id;
    END IF;
END //

DELIMITER ;