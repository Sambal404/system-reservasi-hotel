// src/components/RecentReservationTable.jsx
import { useState } from 'react';

function RecentReservationTable({ reservations = [] }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [isExpandedFull, setIsExpandedFull] = useState(false); // State untuk memperluas modul

  const toggleExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className={`bg-white p-5 my-2 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 ${
      isExpandedFull 
        ? 'absolute inset-x-6 top-16 bottom-6 z-40 overflow-y-auto shadow-xl' // Meluas menutupi area modul di bawah judul
        : 'relative'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {isExpandedFull ? 'Semua Data Reservasi' : 'Reservasi Terbaru'}
        </h3>
        
        {/* Tombol Lihat Semua / Tutup */}
        <button 
          onClick={() => setIsExpandedFull(!isExpandedFull)}
          className="text-xs text-blue-600 font-medium hover:underline focus:outline-none"
        >
          {isExpandedFull ? 'Tutup' : 'Lihat Semua'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs table-auto">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100">
              <th className="pb-3 font-medium w-[18%]">No. Reservasi</th>
              <th className="pb-3 font-medium w-[18%]">Tamu</th>
              <th className="pb-3 font-medium w-[30%]">Detail Kamar</th>
              <th className="pb-3 font-medium w-[14%]">Dibuat Oleh</th>
              <th className="pb-3 font-medium w-[10%]">Pembayaran</th>
              <th className="pb-3 font-medium w-[10%]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {reservations.length > 0 ? (
              reservations.map((item) => {
                const rooms = item.rooms_detail || [];
                const isExpanded = expandedRows[item.reservation_id];
                const primaryRoom = rooms[0];
                const hiddenRooms = rooms.slice(1);
                const hiddenCount = hiddenRooms.length;

                return (
                  <tr key={item.reservation_id} className="hover:bg-slate-50/50 align-top">
                    <td className="py-3.5 font-medium text-[#C5A059] truncate pr-2">
                      {item.reservation_code}
                    </td>
                    <td className="py-3.5 font-medium text-slate-800 pr-2">
                      {item.guest_name}
                    </td>
                    <td className="py-3.5 pr-2">
                      <div className="space-y-1">
                        {primaryRoom && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700">
                              {primaryRoom.total_rooms}x
                            </span>
                            <span className="text-slate-600">
                              {primaryRoom.room_type_name}
                            </span>
                            {hiddenCount > 0 && !isExpanded && (
                              <button
                                onClick={() => toggleExpand(item.reservation_id)}
                                className="text-[10px] font-semibold bg-amber-50 text-[#C5A059] hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors ml-1"
                              >
                                +{hiddenCount} lainnya
                              </button>
                            )}
                          </div>
                        )}
                        {isExpanded && hiddenRooms.map((room, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">
                              {room.total_rooms}x
                            </span>
                            <span className="text-slate-600">
                              {room.room_type_name}
                            </span>
                          </div>
                        ))}
                        {isExpanded && (
                          <button
                            onClick={() => toggleExpand(item.reservation_id)}
                            className="text-[10px] font-medium text-rose-500 hover:underline block pt-0.5"
                          >
                            Tutup rincian
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 pr-2">
                      {item.created_by || '-'}
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                        item.payment_status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : item.payment_status === 'partial' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                        item.reservation_status === 'confirmed' || item.reservation_status === 'checked-in'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.reservation_status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-400">
                  Belum ada data reservasi terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentReservationTable;