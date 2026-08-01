import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Search, 
  Calendar, 
  User, 
  BedDouble, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X,
  FileText,
  CreditCard,
  History
} from 'lucide-react';

const CheckIn = () => {
  // ====== STATE ======
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending', // Default hanya tampilkan yang pending/akan check-in
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [checkInData, setCheckInData] = useState({
    idCardVerified: false,
    paymentConfirmed: false,
    depositAmount: 0,
    notes: ''
  });
  const [processing, setProcessing] = useState(false);

  // ====== FETCH DATA ======
  const fetchReferenceData = async () => {
    try {
      const [guestsRes, roomsRes] = await Promise.all([
        api.get('/guests'),
        api.get('/rooms')
      ]);
      setGuests(guestsRes.data.success ? guestsRes.data.data : []);
      setRooms(roomsRes.data.success ? roomsRes.data.data : []);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/reservations');
      let allReservations = response.data.success ? response.data.data : [];

      // Filter lokal: Fokus pada reservasi yang perlu di-check-in (pending/confirmed) atau sudah active
      let filtered = allReservations.filter(r => ['pending', 'confirmed', 'active'].includes(r.status));

      // Search filter
      if (filters.search) {
        const keyword = filters.search.toLowerCase();
        filtered = filtered.filter(r => {
          const guestName = getGuestName(r.guest_id).toLowerCase();
          const roomNum = getRoomNumber(r.room_id).toLowerCase();
          const code = (r.reservation_code || '').toLowerCase();
          return guestName.includes(keyword) || roomNum.includes(keyword) || code.includes(keyword);
        });
      }

      // Status filter
      if (filters.status !== 'all') {
        filtered = filtered.filter(r => r.status === filters.status);
      }

      setReservations(filtered);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.response?.data?.message || 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchReservations();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [filters]);

  // ====== HELPER FUNCTIONS ======
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getGuestName = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    return guest ? guest.name : 'Tamu Tidak Dikenal';
  };

  const getRoomNumber = (roomId) => {
    if (!roomId) return 'Belum Ditentukan';
    const room = rooms.find(r => r.id === roomId);
    return room ? room.room_number : 'Belum Ditentukan';
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-600 text-white shadow-sm',
      'confirmed': 'bg-slate-800 text-yellow-400 shadow-sm',
      'active': 'bg-gray-800 text-white shadow-sm',
      'canceled': 'bg-red-900 text-red-200 shadow-sm'
    };
    const labels = {
      'pending': 'Menunggu Check-In',
      'confirmed': 'Terkonfirmasi',
      'active': 'Sedang Menginap',
      'canceled': 'Dibatalkan'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-500 text-white'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // ====== STATISTICS ======
  const today = new Date().toISOString().split('T')[0];
  const todayCheckIns = reservations.filter(r => r.check_in_date === today && (r.status === 'pending' || r.status === 'confirmed')).length;
  const activeGuests = reservations.filter(r => r.status === 'active').length;
  const totalActiveRevenue = reservations
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + (parseFloat(r.total_price) || 0), 0);

  // ====== HANDLERS ======
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'pending' });
  };

  const handleOpenCheckIn = (reservation) => {
    setSelectedReservation(reservation);
    setCheckInData({
      idCardVerified: false,
      paymentConfirmed: false,
      depositAmount: Math.ceil((reservation.total_price || 0) * 0.1), // 10% default deposit
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setCheckInData({ idCardVerified: false, paymentConfirmed: false, depositAmount: 0, notes: '' });
  };

  const handleCheckIn = async () => {
    if (!checkInData.idCardVerified || !checkInData.paymentConfirmed) {
      alert('Mohon verifikasi KTP dan konfirmasi pembayaran terlebih dahulu!');
      return;
    }

    try {
      setProcessing(true);
      
      // Payload untuk backend
      const payload = {
        deposit_amount: checkInData.depositAmount,
        notes: checkInData.notes,
        check_in_by: 1 // Ganti dengan ID user yang login saat ini
      };

      // Panggil API untuk update status reservasi ke 'active' dan reservation_rooms ke 'checked_in'
      await api.put(`/reservations/${selectedReservation.id}/check-in`, payload);
      
      alert(`Check-in berhasil untuk ${getGuestName(selectedReservation.guest_id)}!`);
      handleCloseModal();
      fetchReservations(); // Refresh data
      
    } catch (err) {
      console.error('Error check-in:', err);
      alert(err.response?.data?.message || 'Gagal memproses check-in');
    } finally {
      setProcessing(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = reservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reservations.length / itemsPerPage);

  // ====== RENDER ======
  if (loading && reservations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        <span className="ml-3 text-gray-600">Memuat data check-in...</span>
      </div>
    );
  }

  if (error && reservations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center">
        <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchReservations} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Check-In Tamu</h1>
        <p className="text-gray-600">Proses kedatangan dan aktivasi kamar tamu hotel Grand Nusantara</p>
      </div>

      {/* Statistics Cards (Dark & Gold Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Jadwal Check-In Hari Ini</p>
              <p className="text-3xl font-bold mt-1">{todayCheckIns}</p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Menunggu Check-In</p>
              <p className="text-3xl font-bold mt-1">{reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length}</p>
            </div>
            <Clock className="w-12 h-12 text-slate-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Sedang Menginap</p>
              <p className="text-3xl font-bold mt-1">{activeGuests}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-gray-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">Estimasi Revenue Aktif</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalActiveRevenue)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Tamu / No. Kamar / Kode Reservasi</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Masukkan kata kunci..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="pending">Menunggu Check-In</option>
              <option value="confirmed">Terkonfirmasi</option>
              <option value="active">Sedang Menginap</option>
              <option value="all">Semua Status</option>
            </select>
          </div>
        </div>

        {(filters.search || filters.status !== 'pending') && (
          <button onClick={handleClearFilters} className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-1">
            <X className="w-4 h-4" /> Reset Filter
          </button>
        )}
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <FileText className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-800">Daftar Reservasi</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Reservasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Tamu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kamar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentReservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg">Tidak ada reservasi ditemukan</p>
                  </td>
                </tr>
              ) : (
                currentReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {reservation.reservation_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{getGuestName(reservation.guest_id)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <BedDouble className="w-4 h-4 text-yellow-600" />
                        {getRoomNumber(reservation.room_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(reservation.check_in_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(reservation.check_out_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(reservation.total_price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(reservation.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(reservation.status === 'pending' || reservation.status === 'confirmed') ? (
                        <button
                          onClick={() => handleOpenCheckIn(reservation)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors shadow-sm"
                        >
                          Proses Check-In
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Selesai
                        </span>
                      )}
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
              Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, reservations.length)}</span> dari <span className="font-medium">{reservations.length}</span> data
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-yellow-50 text-sm">← Sebelumnya</button>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-yellow-50 text-sm">Selanjutnya →</button>
            </div>
          </div>
        )}
      </div>

      {/* Check-In History (Today's Active) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <History className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Check-In Hari Ini</h2>
        </div>
        <div className="p-6">
          {reservations.filter(r => r.status === 'active' && r.updated_at?.startsWith(today)).length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada tamu yang check-in hari ini</p>
          ) : (
            <div className="space-y-3">
              {reservations
                .filter(r => r.status === 'active' && r.updated_at?.startsWith(today))
                .map((history) => (
                <div key={history.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{getGuestName(history.guest_id)}</p>
                      <p className="text-xs text-gray-600">Room {getRoomNumber(history.room_id)} • {new Date(history.updated_at).toLocaleTimeString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">
                    Berhasil Check-In
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-In Modal */}
      {isModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">Proses Check-In</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Reservation Info Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Detail Reservasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-yellow-700 text-xs uppercase tracking-wide">Nama Tamu</p>
                    <p className="font-semibold text-gray-900">{getGuestName(selectedReservation.guest_id)}</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs uppercase tracking-wide">Kamar</p>
                    <p className="font-semibold text-gray-900">{getRoomNumber(selectedReservation.room_id)}</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs uppercase tracking-wide">Durasi</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedReservation.check_in_date)} s/d {formatDate(selectedReservation.check_out_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs uppercase tracking-wide">Total Biaya</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedReservation.total_price)}</p>
                  </div>
                </div>
              </div>

              {/* Check-In Form */}
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Verifikasi & Konfirmasi</h3>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="idCardVerified"
                    checked={checkInData.idCardVerified}
                    onChange={(e) => setCheckInData({...checkInData, idCardVerified: e.target.checked})}
                    className="mt-1 w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 border-gray-300"
                  />
                  <label htmlFor="idCardVerified" className="flex-1 cursor-pointer">
                    <p className="text-sm font-semibold text-gray-900">Verifikasi Identitas (KTP/Paspor)</p>
                    <p className="text-xs text-gray-500">Pastikan fisik identitas tamu sesuai dengan data reservasi.</p>
                  </label>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="paymentConfirmed"
                    checked={checkInData.paymentConfirmed}
                    onChange={(e) => setCheckInData({...checkInData, paymentConfirmed: e.target.checked})}
                    className="mt-1 w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 border-gray-300"
                  />
                  <label htmlFor="paymentConfirmed" className="flex-1 cursor-pointer">
                    <p className="text-sm font-semibold text-gray-900">Konfirmasi Pembayaran / Deposit</p>
                    <p className="text-xs text-gray-500">Pastikan pembayaran penuh atau uang muka telah diterima.</p>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Deposit Dibayarkan</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                      <input
                        type="number"
                        value={checkInData.depositAmount}
                        onChange={(e) => setCheckInData({...checkInData, depositAmount: parseInt(e.target.value) || 0})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Khusus (Opsional)</label>
                    <input
                      type="text"
                      value={checkInData.notes}
                      onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
                      placeholder="Contoh: Kunci ekstra diberikan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 z-10">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCheckIn}
                disabled={!checkInData.idCardVerified || !checkInData.paymentConfirmed || processing}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-colors shadow-md"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Konfirmasi Check-In
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;