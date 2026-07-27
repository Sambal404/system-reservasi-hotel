-- Create: Tambah Reservasi baru, kalo tamu belum terdaftar di buku tamu atau table Guests. akan di tambah otomatis, minta input tambahan nama no tel nik tamu
INSERT INTO reservations (
    guest_id, 
    room_id, 
    user_id, 
    check_in_date, 
    check_out_date, 
    total_price, 
    payment_status, -- Nilai awal default 'UNPAID' atau sesuai input
    status -- Nilai awal default 'BOOKED' atau sesuai input
) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
);