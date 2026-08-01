// src/pages/Reservations.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Pencil, 
  BedDouble 
} from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // State untuk melacak baris mana saja yang sedang terbuka detailnya (accordion)
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    setLoading(true);
    // Data dummy yang sudah mencakup struktur detail kamar (rooms_detail)
    const dummyData = [
      {
        reservation_id: 1,
        reservation_code: 'RES-20260801-ABCD',
        guest_name: 'Budi Santoso',
        status: 'confirmed',
        payment_status: 'paid',
        rooms_detail: [
          { room_type: 'Deluxe Room', room_number: '101', adults: 2, children: 1, status: 'Booked' },
          { room_type: 'Standard Room', room_number: null, adults: 1, children: 0, status: 'Booked' }
        ]
      },
      {
        reservation_id: 2,
        reservation_code: 'RES-20260802-EFGH',
        guest_name: 'Siti Aminah',
        status: 'active',
        payment_status: 'paid',
        rooms_detail: [
          { room_type: 'Suite Room', room_number: '202', adults: 2, children: 0, status: 'Checked-In' }
        ]
      },
      {
        reservation_id: 3,
        reservation_code: 'RES-20260803-IJKL',
        guest_name: 'Joko Widodo',
        status: 'pending',
        payment_status: 'unpaid',
        rooms_detail: [
          { room_type: 'Standard Room', room_number: null, adults: 2, children: 0, status: 'Pending' },
          { room_type: 'Standard Room', room_number: null, adults: 1, children: 0, status: 'Pending' }
        ]
      }
    ];

    setTimeout(() => {
      setReservations(dummyData);
      setLoading(false);
    }, 300);
  }, []);

  // Toggle buka/tutup accordion detail baris tabel
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter data berdasarkan search & status button
  const filteredReservations = reservations.filter((item) => {
    const matchesSearch =
      item.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reservation_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">Confirmed</span>;
      case 'active':
        return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Active</span>;
      case 'pending':
        return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Pending</span>;
      case 'canceled':
        return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Canceled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">Paid</span>;
      case 'unpaid':
        return <span className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md">Unpaid</span>;
      case 'refunded':
        return <span className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md">Refunded</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 border rounded-md">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman & Add Reservation Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Reservasi</h1>
          <p className="text-sm text-gray-500">Kelola pesanan kamar dan penugasan fisik kamar tamu.</p>
        </div>
        <button
          onClick={() => alert('Buka Modal Add New Reservation')}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Reservation
        </button>
      </div>

      {/* Search Bar & Filter Status Buttons */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Cari nama tamu atau kode (cth: RES-...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Filter Status Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'pending', 'confirmed', 'active', 'canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Kode Reservasi</th>
                <th className="py-3.5 px-6">Nama Tamu</th>
                <th className="py-3.5 px-6">Detail Kamar</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Payment Status</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">Memuat data...</td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">Tidak ada data reservasi ditemukan.</td>
                </tr>
              ) : (
                filteredReservations.map((item) => {
                  const isOpen = !!expandedRows[item.reservation_id];
                  return (
                    <React.Fragment key={item.reservation_id}>
                      <tr className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6 font-medium text-indigo-600">{item.reservation_code}</td>
                        <td className="py-4 px-6 text-gray-900 font-semibold">{item.guest_name}</td>
                        
                        {/* Kolom Detail Kamar dengan Tombol Panah Buka/Tutup */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleRow(item.reservation_id)}
                            className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md transition"
                          >
                            <BedDouble className="w-3.5 h-3.5 mr-1.5" />
                            <span>{item.rooms_detail.length} Kamar Dipesan</span>
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 ml-1.5 transition-transform" />
                            ) : (
                              <ChevronRight className="w-4 h-4 ml-1.5 transition-transform" />
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                        <td className="py-4 px-6">{getPaymentBadge(item.payment_status)}</td>
                        
                        {/* Kolom Aksi (Icon Pensil untuk Update) */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => alert(`Update data reservasi ID: ${item.reservation_id}`)}
                            title="Update Data Reservasi"
                            className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-lg border border-gray-200 hover:border-indigo-200 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Baris Accordion Detail (Ramping & Selaras Secara Vertikal) */}
                      {isOpen && (
                        <tr className="bg-gray-50/70">
                          <td colSpan="6" className="px-6 py-3">
                            <div className="pl-6 border-l-2 border-indigo-500 space-y-2">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Rincian Unit Kamar Dipesan:
                              </p>
                              <div className="divide-y divide-gray-200/60 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-2xs">
                                {item.rooms_detail.map((room, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2.5 text-xs gap-2 hover:bg-gray-50/80 transition"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="font-semibold text-gray-800">{room.room_type}</span>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                        {room.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-6 text-gray-500">
                                      <div>
                                        <span className="text-gray-400 mr-1.5">No. Kamar:</span>
                                        <span className={room.room_number ? "font-medium text-gray-800" : "italic text-amber-600 font-medium"}>
                                          {room.room_number ? `No. ${room.room_number}` : 'unassigned'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 mr-1.5">Tamu:</span>
                                        <span className="font-medium text-gray-800">
                                          {room.adults} Dewasa{room.children > 0 ? `, ${room.children} Anak` : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}