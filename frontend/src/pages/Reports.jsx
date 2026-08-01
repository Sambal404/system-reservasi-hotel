import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  BedDouble, 
  TrendingUp,
  FileText,
  Printer,
  ChevronDown,
  Filter
} from 'lucide-react';

const Reports = () => {
  // ====== STATE ======
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalReservations: 0,
    totalGuests: 0,
    occupancyRate: 0,
    averageStay: 0,
    revenueByRoomType: [],
    dailyRevenue: [],
    topGuests: [],
    reservationsByStatus: []
  });

  const [activeTab, setActiveTab] = useState('overview');

  // ====== FETCH REPORT DATA ======
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [reservationsRes, guestsRes, roomsRes, roomTypesRes] = await Promise.all([
        api.get('/reservations'),
        api.get('/guests'),
        api.get('/rooms'),
        api.get('/room-types')
      ]);

      const reservations = reservationsRes.data.success ? reservationsRes.data.data : [];
      const guests = guestsRes.data.success ? guestsRes.data.data : [];
      const rooms = roomsRes.data.success ? roomsRes.data.data : [];
      const roomTypes = roomTypesRes.data.success ? roomTypesRes.data.data : [];

      // Filter reservations by date range
      const filteredReservations = reservations.filter(r => {
        const resDate = new Date(r.created_at);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        return resDate >= start && resDate <= end;
      });

      // Calculate metrics
      const totalRevenue = filteredReservations.reduce((sum, r) => sum + (parseFloat(r.total_price) || 0), 0);
      const totalReservations = filteredReservations.length;
      
      // Get unique guests
      const uniqueGuestIds = [...new Set(filteredReservations.map(r => r.guest_id))];
      const totalGuests = uniqueGuestIds.length;

      // Calculate occupancy rate
      const activeReservations = reservations.filter(r => r.status === 'active');
      const occupiedRooms = activeReservations.length;
      const totalRooms = rooms.length;
      const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

      // Average stay duration
      const avgStay = filteredReservations.length > 0 
        ? filteredReservations.reduce((sum, r) => {
            const checkIn = new Date(r.check_in_date);
            const checkOut = new Date(r.check_out_date);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            return sum + nights;
          }, 0) / filteredReservations.length
        : 0;

      // Revenue by room type
      const revenueByRoomType = roomTypes.map(rt => {
        const typeReservations = filteredReservations.filter(r => r.room_type_id === rt.id);
        const revenue = typeReservations.reduce((sum, r) => sum + (parseFloat(r.total_price) || 0), 0);
        return {
          name: rt.name,
          revenue,
          count: typeReservations.length
        };
      }).filter(rt => rt.count > 0);

      // Daily revenue (last 7 days)
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRevenue = filteredReservations
          .filter(r => r.created_at.startsWith(dateStr))
          .reduce((sum, r) => sum + (parseFloat(r.total_price) || 0), 0);
        
        dailyRevenue.push({
          date: dateStr,
          label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
          revenue: dayRevenue
        });
      }

      // Top guests (by spending)
      const guestSpending = {};
      filteredReservations.forEach(r => {
        if (!guestSpending[r.guest_id]) {
          guestSpending[r.guest_id] = { name: '', total: 0, visits: 0 };
        }
        guestSpending[r.guest_id].total += parseFloat(r.total_price) || 0;
        guestSpending[r.guest_id].visits += 1;
      });

      const topGuests = Object.entries(guestSpending)
        .map(([guestId, data]) => ({
          guestId,
          name: guests.find(g => g.id === parseInt(guestId))?.name || 'Unknown',
          ...data
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Reservations by status
      const statusCount = {};
      filteredReservations.forEach(r => {
        statusCount[r.status] = (statusCount[r.status] || 0) + 1;
      });
      
      const reservationsByStatus = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count
      }));

      setReportData({
        totalRevenue,
        totalReservations,
        totalGuests,
        occupancyRate,
        averageStay: avgStay.toFixed(1),
        revenueByRoomType,
        dailyRevenue,
        topGuests,
        reservationsByStatus
      });

    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

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
      day: 'long',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const exportToPDF = () => {
    alert('Fitur export PDF akan segera tersedia!');
    // Implementasi: Gunakan library seperti jsPDF atau react-pdf
  };

  const exportToExcel = () => {
    alert('Fitur export Excel akan segera tersedia!');
    // Implementasi: Gunakan library seperti xlsx atau exceljs
  };

  // ====== RENDER ======
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Laporan & Statistik</h1>
          <p className="text-gray-600">Analisis performa hotel Grand Nusantara</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 text-sm font-medium shadow-md"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filter Periode</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-gray-600">
          Menampilkan data dari <span className="font-semibold">{formatDate(dateRange.start)}</span> sampai <span className="font-semibold">{formatDate(dateRange.end)}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Pendapatan</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Reservasi</p>
              <p className="text-3xl font-bold mt-1">{reportData.totalReservations}</p>
            </div>
            <FileText className="w-10 h-10 text-slate-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Tamu Unik</p>
              <p className="text-3xl font-bold mt-1">{reportData.totalGuests}</p>
            </div>
            <Users className="w-10 h-10 text-gray-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">Tingkat Okupansi</p>
              <p className="text-3xl font-bold mt-1">{reportData.occupancyRate}%</p>
            </div>
            <BedDouble className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'revenue'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pendapatan
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'guests'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tamu
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Revenue by Room Type */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-yellow-600" />
                        Pendapatan per Tipe Kamar
                      </h3>
                      <div className="space-y-3">
                        {reportData.revenueByRoomType.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">Tidak ada data</p>
                        ) : (
                          reportData.revenueByRoomType.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.count} reservasi</p>
                              </div>
                              <p className="font-semibold text-yellow-700">{formatCurrency(item.revenue)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Reservations by Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-yellow-600" />
                        Status Reservasi
                      </h3>
                      <div className="space-y-3">
                        {reportData.reservationsByStatus.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">Tidak ada data</p>
                        ) : (
                          reportData.reservationsByStatus.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  item.status === 'active' ? 'bg-gray-800' :
                                  item.status === 'pending' ? 'bg-yellow-600' :
                                  item.status === 'confirmed' ? 'bg-slate-800' :
                                  'bg-green-800'
                                }`} />
                                <span className="capitalize font-medium text-gray-900">{item.status}</span>
                              </div>
                              <span className="font-semibold text-gray-700">{item.count}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Average Stay */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">Rata-rata Durasi Menginap</p>
                        <p className="text-3xl font-bold text-yellow-700 mt-1">{reportData.averageStay} malam</p>
                      </div>
                      <Calendar className="w-12 h-12 text-yellow-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pendapatan Harian (7 Hari Terakhir)</h3>
                  <div className="space-y-3">
                    {reportData.dailyRevenue.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Tidak ada data pendapatan</p>
                    ) : (
                      reportData.dailyRevenue.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{day.label}</p>
                              <p className="text-xs text-gray-500">{day.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-700">{formatCurrency(day.revenue)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Guests Tab */}
              {activeTab === 'guests' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Tamu Berdasarkan Pengeluaran</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peringkat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Tamu</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Kunjungan</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Pengeluaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.topGuests.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                              Tidak ada data tamu
                            </td>
                          </tr>
                        ) : (
                          reportData.topGuests.map((guest, index) => (
                            <tr key={index} className="hover:bg-yellow-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-600 text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">{guest.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{guest.visits} kunjungan</td>
                              <td className="px-4 py-3 text-right font-semibold text-yellow-700">
                                {formatCurrency(guest.total)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Printer className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">Cetak Laporan</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Cetak laporan untuk arsip atau presentasi</p>
          <button
            onClick={() => window.print()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Print Laporan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">Pertumbuhan</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Lihat tren okupansi dan revenue</p>
          <div className="text-2xl font-bold text-yellow-700">
            +{((reportData.occupancyRate / 100) * 12).toFixed(0)}%
          </div>
          <p className="text-xs text-gray-500">vs bulan lalu</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">Kepuasan Tamu</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Rating rata-rata tamu</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-yellow-700">4.8</span>
            <span className="text-gray-400 text-sm">/5.0</span>
          </div>
          <p className="text-xs text-gray-500">Berdasarkan 128 review</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;