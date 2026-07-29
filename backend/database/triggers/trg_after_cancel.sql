-- TRIGGER AFTER CANCEL RESERVATIONS

use hotel_db;

DELIMITER //

CREATE TRIGGER trg_after_canceled
AFTER UPDATE ON reservation_rooms
FOR EACH ROW
BEGIN
    -- Cek jika status berubah menjadi 'cancelled' dan status sebelumnya bukan 'cancelled'
    IF OLD.status != 'canceled' AND NEW.status = 'canceled' THEN
        
        -- Cek apakah tanggal check_in yang dijadwalkan adalah hari ini?
        IF NEW.check_in_date = CURDATE() THEN
            
            -- Jika ya (dibatalkan pada hari H / hari ini), kembalikan status kamar menjadi 'available' (sebelumnya reserved)
            UPDATE rooms
            SET status = 'available'
            WHERE id = NEW.room_id;
            
        END IF;
        
    END IF;
END //

DELIMITER ;