-- detail info tentang room_type atau kelas kamar.

CREATE VIEW vw_room_type_details AS
SELECT 
    rt.id AS room_type_id,
    rt.name AS room_type_name,
    rt.base_price,
    rt.description,
    
    -- Menggabungkan semua fasilitas (amenities) menjadi format JSON Array yang rapi untuk React
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', a.id,
                'name', a.name,
                'icon', a.icon
            )
        )
        FROM room_type_amenities rta
        JOIN amenities a ON rta.amenity_id = a.id
        WHERE rta.room_type_id = rt.id
    ) AS amenities_list

FROM room_types rt;