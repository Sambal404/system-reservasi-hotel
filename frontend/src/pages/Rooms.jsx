import { useState, useEffect } from 'react';
import api from '../api/api';

const Rooms = () => {
  // State untuk data rooms
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter
  const [filters, setFilters] = useState({
    status: '',
    roomTypeId: '',
    search: '',
  });

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6);

  // Fetch rooms dari backend
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
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
      
      if (response.data.success) {
        setRooms(response.data.data);
        // Jika backend kirim pagination info
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        setError(response.data.message || 'Gagal mengambil data rooms');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.response?.data?.message || 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pertama kali saat component mount
  useEffect(() => {
    fetchRooms();
  }, [currentPage]);

  // Fetch ulang saat filter berubah (reset ke halaman 1)
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchRooms();
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timer);
  }, [filters]);

  // Handle perubahan filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      roomTypeId: '',
      search: '',
    });
    setCurrentPage(1);
  };

  // Format status dengan warna
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-500 text-white';
      case 'occupied':
        return 'bg-red-500 text-white';
      case 'maintenance':
        return 'bg-yellow-500 text-white';
      case 'reserved':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format status untuk display
  const getStatusText = (status) => {
    const statusMap = {
      'available': 'Tersedia',
      'occupied': 'Terisi',
      'maintenance': 'Perbaikan',
      'reserved': 'Dipesan'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  // Format harga
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Loading state
  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Memuat data rooms...</span>
      </div>
    );
  }

  // Error state
  if (error && rooms.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchRooms}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Kamar</h1>
        <p className="text-gray-600">Kelola daftar kamar hotel Grand Nusantara</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter & Pencarian</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Nomor Kamar
            </label>
            <input
              type="text"
              name="search"
              placeholder="Contoh: 101, 205..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="1">Standar Room</option>
              <option value="2">Deluxe Room</option>
              <option value="3">Superior Room</option>
              <option value="4">Executive Room</option>
              <option value="5">Suite Room</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.status || filters.roomTypeId || filters.search) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="text-center py-12">
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
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Room Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={room.photo || '/images/room-default.jpg'}
                  alt={room.type || 'Room'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/room-default.jpg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                </div>
              </div>

              {/* Room Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{room.type || 'Room Type'}</h3>
                    <p className="text-gray-600 text-sm">No. {room.room_number}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Lantai {room.floor || '-'}
                  </div>
                  
                  {room.roomType && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {room.roomType.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(room.price || room.roomType?.base_price || 0)}
                    </p>
                    <p className="text-xs text-gray-500">/malam</p>
                  </div>
                  
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      room.status?.toLowerCase() === 'available'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={room.status?.toLowerCase() !== 'available'}
                  >
                    {room.status?.toLowerCase() === 'available' ? 'Pesan' : 'Tidak Tersedia'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Sebelumnya
          </button>
          
          <span className="px-4 py-2 text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {rooms.filter(r => r.status?.toLowerCase() === 'available').length}
          </p>
          <p className="text-sm text-green-800">Tersedia</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {rooms.filter(r => r.status?.toLowerCase() === 'occupied').length}
          </p>
          <p className="text-sm text-red-800">Terisi</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {rooms.filter(r => r.status?.toLowerCase() === 'reserved').length}
          </p>
          <p className="text-sm text-blue-800">Dipesan</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {rooms.filter(r => r.status?.toLowerCase() === 'maintenance').length}
          </p>
          <p className="text-sm text-yellow-800">Perbaikan</p>
        </div>
      </div>
    </div>
  );
};

export default Rooms;