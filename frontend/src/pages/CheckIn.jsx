import { useState } from 'react';

const CheckIn = () => {
  // ====== DATA DUMMY ======
  const [reservations, setReservations] = useState([
    {
      id: 1,
      guestName: "Budi Santoso",
      guestPhone: "081234567890",
      guestIdCard: "3201012345678901",
      roomNumber: "101",
      roomType: "Deluxe Room",
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-03",
      nights: 2,
      totalPrice: 1500000,
      status: "pending",
      specialRequest: "Extra bed, non-smoking room"
    },
    {
      id: 2,
      guestName: "Siti Aminah",
      guestPhone: "082345678901",
      guestIdCard: "3201012345678902",
      roomNumber: "205",
      roomType: "Suite Room",
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-05",
      nights: 4,
      totalPrice: 12000000,
      status: "pending",
      specialRequest: "Ocean view, late check-out"
    },
    {
      id: 3,
      guestName: "Andi Wijaya",
      guestPhone: "083456789012",
      guestIdCard: "3201012345678903",
      roomNumber: "302",
      roomType: "Executive Room",
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-02",
      nights: 1,
      totalPrice: 1200000,
      status: "pending",
      specialRequest: ""
    },
    {
      id: 4,
      guestName: "Dewi Lestari",
      guestPhone: "084567890123",
      guestIdCard: "3201012345678904",
      roomNumber: "108",
      roomType: "Standar Room",
      checkInDate: "2026-07-31",
      checkOutDate: "2026-08-02",
      nights: 2,
      totalPrice: 1500000,
      status: "checked-in",
      specialRequest: "Early check-in requested"
    },
    {
      id: 5,
      guestName: "Rudi Hermawan",
      guestPhone: "085678901234",
      guestIdCard: "3201012345678905",
      roomNumber: "410",
      roomType: "Deluxe Room",
      checkInDate: "2026-07-30",
      checkOutDate: "2026-08-01",
      nights: 2,
      totalPrice: 1500000,
      status: "checked-in",
      specialRequest: ""
    }
  ]);

  const [checkedInHistory, setCheckedInHistory] = useState([
    {
      id: 101,
      guestName: "Maya Sari",
      roomNumber: "203",
      checkInTime: "2026-07-31 14:30",
      staffName: "FO_Dewi"
    },
    {
      id: 102,
      guestName: "Joko Susilo",
      roomNumber: "315",
      checkInTime: "2026-07-31 16:45",
      staffName: "FO_Dewi"
    }
  ]);

  // ====== STATE ======
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [checkInData, setCheckInData] = useState({
    idCardVerified: false,
    paymentConfirmed: false,
    depositAmount: 0,
    notes: ''
  });

  // ====== HELPER FUNCTIONS ======
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'checked-in': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      'pending': 'Menunggu Check-In',
      'checked-in': 'Sudah Check-In',
      'cancelled': 'Dibatalkan'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // ====== HANDLERS ======
  const handleOpenCheckIn = (reservation) => {
    setSelectedReservation(reservation);
    setCheckInData({
      idCardVerified: false,
      paymentConfirmed: false,
      depositAmount: reservation.totalPrice * 0.1, // 10% deposit
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setCheckInData({
      idCardVerified: false,
      paymentConfirmed: false,
      depositAmount: 0,
      notes: ''
    });
  };

  const handleCheckIn = () => {
    if (!checkInData.idCardVerified || !checkInData.paymentConfirmed) {
      alert('Mohon verifikasi KTP dan konfirmasi pembayaran terlebih dahulu!');
      return;
    }

    // Update reservation status
    const updatedReservations = reservations.map(res =>
      res.id === selectedReservation.id
        ? { ...res, status: 'checked-in', checkInTime: new Date().toISOString() }
        : res
    );
    setReservations(updatedReservations);

    // Add to history
    const newHistory = {
      id: Date.now(),
      guestName: selectedReservation.guestName,
      roomNumber: selectedReservation.roomNumber,
      checkInTime: new Date().toLocaleString('id-ID'),
      staffName: 'FO_Dewi'
    };
    setCheckedInHistory([newHistory, ...checkedInHistory]);

    alert(`Check-in berhasil untuk ${selectedReservation.guestName}!`);
    handleCloseModal();
  };

  const filteredReservations = reservations.filter(res => {
    const matchSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       res.roomNumber.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || res.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ====== STATISTICS ======
  const todayCheckIns = reservations.filter(r => 
    r.checkInDate === '2026-08-01' && r.status === 'pending'
  ).length;
  
  const completedCheckIns = reservations.filter(r => r.status === 'checked-in').length;
  const totalRevenue = reservations
    .filter(r => r.status === 'checked-in')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  // ====== RENDER ======
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Check-In Tamu</h1>
        <p className="text-gray-600">Proses check-in tamu hotel Grand Nusantara</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Check-In Hari Ini</p>
              <p className="text-3xl font-bold mt-1">{todayCheckIns}</p>
            </div>
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Sudah Check-In</p>
              <p className="text-3xl font-bold mt-1">{completedCheckIns}</p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Reservasi</p>
              <p className="text-3xl font-bold mt-1">{reservations.length}</p>
            </div>
            <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Revenue Hari Ini</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <svg className="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Tamu / Nomor Kamar
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Masukkan nama tamu atau nomor kamar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Check-In</option>
              <option value="checked-in">Sudah Check-In</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Reservasi</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Reservasi</th>
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
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Tidak ada reservasi ditemukan
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #RES{String(reservation.id).padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{reservation.guestName}</div>
                      <div className="text-xs text-gray-500">{reservation.guestPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Room {reservation.roomNumber}</div>
                      <div className="text-xs text-gray-500">{reservation.roomType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(reservation.checkInDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(reservation.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(reservation.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {reservation.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenCheckIn(reservation)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          Check-In
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Check-In Hari Ini</h2>
        </div>
        
        <div className="p-6">
          {checkedInHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada check-in hari ini</p>
          ) : (
            <div className="space-y-3">
              {checkedInHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{history.guestName}</p>
                      <p className="text-xs text-gray-500">Room {history.roomNumber} • {history.checkInTime}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Staff: {history.staffName}
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
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Proses Check-In</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Reservation Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Detail Reservasi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Nama Tamu</p>
                    <p className="font-medium text-gray-900">{selectedReservation.guestName}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">No. KTP</p>
                    <p className="font-medium text-gray-900">{selectedReservation.guestIdCard}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Kamar</p>
                    <p className="font-medium text-gray-900">Room {selectedReservation.roomNumber} - {selectedReservation.roomType}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Durasi</p>
                    <p className="font-medium text-gray-900">{selectedReservation.nights} malam</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Total Biaya</p>
                    <p className="font-medium text-gray-900">{formatCurrency(selectedReservation.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Request Khusus</p>
                    <p className="font-medium text-gray-900">{selectedReservation.specialRequest || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Check-In Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-3">Verifikasi Check-In</h3>
                
                {/* ID Card Verification */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="idCardVerified"
                    checked={checkInData.idCardVerified}
                    onChange={(e) => setCheckInData({...checkInData, idCardVerified: e.target.checked})}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="idCardVerified" className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Verifikasi KTP/Identitas</p>
                    <p className="text-xs text-gray-500">Pastikan identitas tamu sesuai dengan reservasi</p>
                  </label>
                </div>

                {/* Payment Confirmation */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="paymentConfirmed"
                    checked={checkInData.paymentConfirmed}
                    onChange={(e) => setCheckInData({...checkInData, paymentConfirmed: e.target.checked})}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="paymentConfirmed" className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Konfirmasi Pembayaran</p>
                    <p className="text-xs text-gray-500">Pembayaran penuh atau deposit telah diterima</p>
                  </label>
                </div>

                {/* Deposit Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Deposit (10% dari total)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      value={checkInData.depositAmount}
                      onChange={(e) => setCheckInData({...checkInData, depositAmount: parseInt(e.target.value) || 0})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Check-In
                  </label>
                  <textarea
                    value={checkInData.notes}
                    onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tambahkan catatan jika ada..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleCheckIn}
                disabled={!checkInData.idCardVerified || !checkInData.paymentConfirmed}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Konfirmasi Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;