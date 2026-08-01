import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Search, 
  Plus, 
  Eye, 
  XCircle,
  ChevronLeft, 
  ChevronRight,
  Calendar,
  User,
  DollarSign,
  Filter,
  X,
  BedDouble,
  Clock,
  CheckCircle2
} from 'lucide-react';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter & search
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const [itemsPerPage] = useState(10);

  // State untuk modal & form
  const [showModal, setShowModal] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  const [formData, setFormData] = useState({
    guest_id: '',
    room_type_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    total_adults: 1,
    total_children: 0,
    payment_method: 'cash',
    payment_type: 'deposit',
    initial_payment: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // ====== FETCH DATA ======
  const fetchGuests = async () => {
    try {
      const response = await api.get('/guests');
      setGuests(response.data.success ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching guests:', err);
    }
  };

  const fetchRoomData = async () => {
    try {
      const [roomTypesRes, roomsRes] = await Promise.all([
        api.get('/room-types'),
        api.get('/rooms')
      ]);
      setRoomTypes(roomTypesRes.data.success ? roomTypesRes.data.data : []);
      setRooms(roomsRes.data.success ? roomsRes.data.data : []);
    } catch (err) {
      console.error('Error fetching room data:', err);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch semua data tanpa params
      const response = await api.get('/reservations');
      let allReservations = response.data.success ? response.data.data : [];

      // Fitur search di lokal (frontend react)
      if (filters.search) {
        const keyword = filters.search.toLowerCase();
        allReservations = allReservations.filter(r => {
          const guestName = getGuestName(r.guest_id).toLowerCase();
          const roomNumber = getRoomNumber(r.room_id).toLowerCase();
          const code = (r.reservation_code || '').toLowerCase();
          
          return code.includes(keyword) || guestName.includes(keyword) || roomNumber.includes(keyword);
        });
      }

      // Fitur filter status
      if (filters.status && filters.status !== 'all') {
        allReservations = allReservations.filter(r => r.status === filters.status);
      }

      setReservations(allReservations);
      setTotalReservations(allReservations.length);
      setTotalPages(Math.ceil(allReservations.length / itemsPerPage));

    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.response?.data?.message || 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  // Load data awal
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGuests(), fetchRoomData()]);
      fetchReservations();
    };
    loadData();
  }, []);

  // Fetch ulang saat filter berubah (debounce)
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchReservations();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // ====== HANDLE FILTER ======
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'all' });
    setCurrentPage(1);
  };

  // ====== HELPER FUNCTIONS ======
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-600 text-white shadow-sm';
      case 'confirmed':
        return 'bg-slate-800 text-yellow-400 shadow-sm';
      case 'active':
        return 'bg-gray-800 text-white shadow-sm';
      case 'completed':
        return 'bg-gray-200 text-gray-700 shadow-sm';
      case 'canceled':
        return 'bg-red-900 text-red-200 shadow-sm';
      default:
        return 'bg-gray-600 text-white shadow-sm';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'unpaid':
        return 'bg-red-900 text-red-200 shadow-sm';
      case 'partial':
        return 'bg-yellow-900 text-yellow-200 shadow-sm';
      case 'paid':
        return 'bg-green-900 text-green-200 shadow-sm';
      default:
        return 'bg-gray-600 text-white shadow-sm';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'active': 'Active',
      'completed': 'Completed',
      'canceled': 'Canceled'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'unpaid': 'Belum Dibayar',
      'partial': 'Sebagian',
      'paid': 'Lunas'
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGuestName = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    return guest ? guest.name : '-';
  };

  const getRoomNumber = (roomId) => {
    if (!roomId) return 'Belum Ditentukan';
    const room = rooms.find(r => r.id === roomId);
    return room ? room.room_number : 'Belum Ditentukan';
  };

  // Slice data untuk pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = reservations.slice(indexOfFirstItem, indexOfLastItem);

  // ====== HANDLE FORM ======
  const calculateTotalPrice = () => {
    if (!formData.room_type_id || !formData.check_in_date || !formData.check_out_date) return 0;
    
    const roomType = roomTypes.find(rt => rt.id === parseInt(formData.room_type_id));
    if (!roomType) return 0;

    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? roomType.base_price * nights : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const totalPrice = calculateTotalPrice();
      const reservationData = {
        guest_id: parseInt(formData.guest_id),
        room_type_id: parseInt(formData.room_type_id),
        room_id: formData.room_id ? parseInt(formData.room_id) : null,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        total_adults: parseInt(formData.total_adults),
        total_children: parseInt(formData.total_children),
        total_price: totalPrice,
        payment_method: formData.payment_method,
        payment_type: formData.payment_type,
        initial_payment: parseFloat(formData.initial_payment) || 0
      };

      await api.post('/reservations', reservationData);
      
      setShowModal(false);
      resetForm();
      fetchReservations();
    } catch (err) {
      console.error('Error saving reservation:', err);
      setFormError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (id, code) => {
    if (!window.confirm(`Apakah Anda yakin ingin membatalkan reservasi ${code}?`)) {
      return;
    }

    try {
      await api.put(`/reservations/${id}/cancel`);
      fetchReservations();
    } catch (err) {
      console.error('Error canceling reservation:', err);
      alert(err.response?.data?.message || 'Gagal membatalkan reservasi');
    }
  };

  const resetForm = () => {
    setFormData({
      guest_id: '',
      room_type_id: '',
      room_id: '',
      check_in_date: '',
      check_out_date: '',
      total_adults: 1,
      total_children: 0,
      payment_method: 'cash',
      payment_type: 'deposit',
      initial_payment: 0
    });
    setFormError(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  // ====== RENDER ======
  if (loading && reservations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        <span className="ml-3 text-gray-600">Memuat data reservasi...</span>
      </div>
    );
  }

  if (error && reservations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center">
        <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchReservations}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reservasi</h1>
          <p className="text-gray-600">Kelola data reservasi hotel Grand Nusantara</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Reservasi Baru
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Reservasi
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="No. reservasi, nama tamu, atau kamar..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Reservasi
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {(filters.search || filters.status !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Reservasi</p>
              <p className="text-3xl font-bold mt-1">{totalReservations}</p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-1">
                {reservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-slate-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Aktif</p>
              <p className="text-3xl font-bold mt-1">
                {reservations.filter(r => r.status === 'active').length}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-gray-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Selesai</p>
              <p className="text-3xl font-bold mt-1">
                {reservations.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Reservasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentReservations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg">Tidak ada data reservasi</p>
                  </td>
                </tr>
              ) : (
                currentReservations.map((reservation, index) => (
                  <tr key={reservation.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{reservation.reservation_code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-yellow-600" />
                        <span className="text-sm text-gray-900">{getGuestName(reservation.guest_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BedDouble className="w-4 h-4 mr-2 text-yellow-600" />
                        <span className="text-sm text-gray-900">{getRoomNumber(reservation.room_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(reservation.check_in_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(reservation.check_out_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-yellow-600" />
                        {formatPrice(reservation.total_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(reservation.payment_status)}`}>
                        {getPaymentStatusText(reservation.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewDetail(reservation)}
                          className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {reservation.status !== 'canceled' && reservation.status !== 'completed' && (
                          <button
                            onClick={() => handleCancel(reservation.id, reservation.reservation_code)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Batalkan"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span>
              {' '}-{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, totalReservations)}</span>
              {' '}dari <span className="font-medium">{totalReservations}</span> reservasi
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

      {/* ====== MODAL FORM ====== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Reservasi Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Tamu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="guest_id"
                    value={formData.guest_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Pilih Tamu</option>
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>{guest.name}</option>
                    ))}
                  </select>
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Kamar <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="room_type_id"
                    value={formData.room_type_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Pilih Tipe Kamar</option>
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name} - {formatPrice(type.base_price)}</option>
                    ))}
                  </select>
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Kamar (Opsional)
                  </label>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Otomatis (Check-in nanti)</option>
                    {rooms
                      .filter(r => r.room_type_id === parseInt(formData.room_type_id) && r.status === 'available')
                      .map(room => (
                        <option key={room.id} value={room.id}>{room.room_number}</option>
                      ))}
                  </select>
                </div>

                {/* Check In */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Check In <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="check_in_date"
                    value={formData.check_in_date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Check Out <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="check_out_date"
                    value={formData.check_out_date}
                    onChange={handleInputChange}
                    required
                    min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Adults */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dewasa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total_adults"
                    value={formData.total_adults}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Children */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anak-anak
                  </label>
                  <input
                    type="number"
                    name="total_children"
                    value={formData.total_children}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Total Price */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Harga
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                    {formatPrice(calculateTotalPrice())}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="cash">Tunai</option>
                    <option value="debit_card">Kartu Debit</option>
                    <option value="credit_card">Kartu Kredit</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="qris">QRIS</option>
                  </select>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="deposit">DP (Uang Muka)</option>
                    <option value="settlement">Pelunasan</option>
                  </select>
                </div>

                {/* Initial Payment */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Pembayaran Awal
                  </label>
                  <input
                    type="number"
                    name="initial_payment"
                    value={formData.initial_payment}
                    onChange={handleInputChange}
                    min="0"
                    max={calculateTotalPrice()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Buat Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== MODAL DETAIL ====== */}
      {viewDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Detail Reservasi</h2>
              <button onClick={() => setViewDetail(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">No. Reservasi</p>
                  <p className="font-semibold text-gray-900 text-lg">{viewDetail.reservation_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewDetail.status)}`}>
                    {getStatusText(viewDetail.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nama Tamu</p>
                  <p className="font-semibold text-gray-900">{getGuestName(viewDetail.guest_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kamar</p>
                  <p className="font-semibold text-gray-900">{getRoomNumber(viewDetail.room_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Check In</p>
                  <p className="font-semibold text-gray-900">{formatDate(viewDetail.check_in_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Check Out</p>
                  <p className="font-semibold text-gray-900">{formatDate(viewDetail.check_out_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                  <p className="font-semibold text-yellow-700 text-lg">{formatPrice(viewDetail.total_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(viewDetail.payment_status)}`}>
                    {getPaymentStatusText(viewDetail.payment_status)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewDetail(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;