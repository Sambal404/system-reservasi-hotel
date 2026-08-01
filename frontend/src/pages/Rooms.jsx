import { useState, useEffect } from 'react';
import api from '../api/api';

const Rooms = () => {
  // State untuk data rooms
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter & search
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    roomTypeId: '',
  });

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [itemsPerPage] = useState(6);

  // State untuk modal (placeholder untuk fitur tambah/edit nanti)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ====== FETCH DATA ======
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await api.get('/rooms', { params });
      let allRooms = response.data.success ? response.data.data : [];
      
      // Fitur search di lokal (frontend react)
      if (filters.search) {
        const keyword = filters.search.toLowerCase();
        allRooms = allRooms.filter ? allRooms.filter(r => 
          (r.room_number && r.room_number.toLowerCase().includes(keyword)) ||
          (r.room_type_name && r.room_type_name.toLowerCase().includes(keyword)) ||
          (r.type && r.type.toLowerCase().includes(keyword))
        ) : allRooms;
      }

      // Fitur filter status
      if (filters.status) {
        allRooms = allRooms.filter(r => r.status === filters.status);
      }

      // Fitur filter tipe kamar
      if (filters.roomTypeId) {
        allRooms = allRooms.filter(r => r.room_type_id == filters.roomTypeId || r.roomType?.id == filters.roomTypeId);
      }

      setRooms(allRooms);
      setTotalRooms(allRooms.length);
      
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }

    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.response?.data?.message || 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saat mount
  useEffect(() => {
    fetchRooms();
  }, [currentPage]);

  // Fetch saat filter berubah (debounce)
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchRooms();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // ====== HANDLE FILTER ======
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', roomTypeId: '' });
    setCurrentPage(1);
  };

  // ====== HELPER FUNCTIONS ======
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-yellow-600 text-white shadow-sm';
      case 'occupied':
        return 'bg-gray-800 text-gray-200 shadow-sm';
      case 'maintenance':
        return 'bg-orange-800 text-white shadow-sm';
      case 'reserved':
        return 'bg-slate-800 text-yellow-400 shadow-sm';
      default:
        return 'bg-gray-600 text-white shadow-sm';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'available': 'Tersedia',
      'occupied': 'Terisi',
      'maintenance': 'Perbaikan',
      'reserved': 'Dipesan'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const formatPrice = (price) => {
    if (!price) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // ====== RENDER ======
  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        <span className="ml-3 text-gray-600">Memuat data kamar...</span>
      </div>
    );
  }

  if (error && rooms.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-yellow-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchRooms}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Kamar</h1>
          <p className="text-gray-600">Kelola daftar kamar hotel Grand Nusantara</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kamar
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Nomor Kamar / Tipe
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Contoh: 101, Deluxe..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Kamar
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="occupied">Terisi</option>
              <option value="maintenance">Perbaikan</option>
              <option value="reserved">Dipesan</option>
            </select>
          </div>

          {/* Room Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Kamar
            </label>
            <select
              name="roomTypeId"
              value={filters.roomTypeId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">Semua Tipe</option>
              <option value="1">Standard Room</option>
              <option value="2">Deluxe Room</option>
              <option value="3">Presidential Suite</option>
            </select>
          </div>
        </div>

        {(filters.search || filters.status || filters.roomTypeId) && (
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Filter
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Kamar</p>
              <p className="text-3xl font-bold mt-1">{totalRooms}</p>
            </div>
            <svg className="w-12 h-12 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tersedia</p>
              <p className="text-3xl font-bold mt-1">
                {rooms.filter(r => r.status?.toLowerCase() === 'available').length}
              </p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Terisi</p>
              <p className="text-3xl font-bold mt-1">
                {rooms.filter(r => r.status?.toLowerCase() === 'occupied').length}
              </p>
            </div>
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Perbaikan</p>
              <p className="text-3xl font-bold mt-1">
                {rooms.filter(r => r.status?.toLowerCase() === 'maintenance').length}
              </p>
            </div>
            <svg className="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 text-lg">Tidak ada kamar yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Room Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={room.photo || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&auto=format&fit=crop&q=60'}
                  alt={room.room_type_name || room.type || 'Room'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                </div>
              </div>

              {/* Room Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{room.room_type_name || room.type || 'Tipe Kamar'}</h3>
                    <p className="text-gray-500 text-sm font-medium">No. {room.room_number}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Lantai {room.floor || '-'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">
                      {formatPrice(room.base_price || room.price || room.roomType?.base_price || 0)}
                    </p>
                    <p className="text-xs text-gray-500">per malam</p>
                  </div>
                  
                  <button
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      room.status?.toLowerCase() === 'available'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={room.status?.toLowerCase() !== 'available'}
                  >
                    {room.status?.toLowerCase() === 'available' ? 'Pesan Sekarang' : 'Tidak Tersedia'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
            {' '}-{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRooms)}</span>
            {' '}dari <span className="font-medium">{totalRooms}</span> kamar
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50 text-sm"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50 text-sm"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;