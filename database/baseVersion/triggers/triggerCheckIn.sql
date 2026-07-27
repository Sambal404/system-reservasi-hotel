-- depreciated

DELIMITER //

CREATE TRIGGER after_reservation_checkin
AFTER UPDATE ON reservation_rooms
FOR EACH ROW
BEGIN
    -- Memeriksa apakah status reservasi baru saja berubah menjadi 'checked_out'
    IF NEW.status = 'checked_in' AND OLD.status != 'checked_in' THEN
        
        -- Secara otomatis mengubah status kebersihan kamar terkait menjadi 'dirty'
        -- dan status kamarnya dikembalikan menjadi 'available' (siap diproses ulang housekeeping)
        UPDATE rooms 
        SET
            status = 'occupied'
        WHERE id IN (
            SELECT room_id 
            FROM reservation_rooms 
            WHERE reservation_id = NEW.id
        );
        
    END IF;
END 
//
DELIMITER ;