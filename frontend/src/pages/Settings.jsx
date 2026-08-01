import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
//   Settings, 
  User, 
  Building2, 
  BedDouble, 
  Wifi, 
  Save, 
  Upload,
  X,
  Plus,
  Trash2,
  Pencil,
  Shield,
  Bell,
  Palette,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  // ====== STATE ======
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Hotel Profile
  const [hotelProfile, setHotelProfile] = useState({
    name: 'Grand Nusantara Hotel',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    logo: null
  });

  // Room Types
  const [roomTypes, setRoomTypes] = useState([]);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    base_price: '',
    description: '',
    max_occupancy: 2
  });

  // Amenities
  const [amenities, setAmenities] = useState([]);
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [amenityForm, setAmenityForm] = useState({
    name: '',
    icon: '',
    description: ''
  });

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  });

  // Change Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    soundNotifications: true,
    newReservationAlert: true,
    checkInReminder: true
  });

  // ====== FETCH DATA ======
  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      
      const [roomTypesRes, amenitiesRes] = await Promise.all([
        api.get('/room-types'),
        api.get('/amenities')
      ]);

      setRoomTypes(roomTypesRes.data.success ? roomTypesRes.data.data : []);
      setAmenities(amenitiesRes.data.success ? amenitiesRes.data.data : []);

      // Load user profile from localStorage or API
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          position: user.position || ''
        });
      }

    } catch (err) {
      console.error('Error fetching settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  // ====== HELPER FUNCTIONS ======
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const parseCurrency = (value) => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ====== HANDLERS - HOTEL PROFILE ======
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setHotelProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put('/settings/hotel-profile', hotelProfile);
      showSuccess('Profil hotel berhasil disimpan!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Gagal menyimpan profil hotel');
    } finally {
      setLoading(false);
    }
  };

  // ====== HANDLERS - ROOM TYPES ======
  const openRoomTypeModal = (roomType = null) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setRoomTypeForm({
        name: roomType.name || '',
        base_price: roomType.base_price?.toString() || '',
        description: roomType.description || '',
        max_occupancy: roomType.max_occupancy || 2
      });
    } else {
      setEditingRoomType(null);
      setRoomTypeForm({
        name: '',
        base_price: '',
        description: '',
        max_occupancy: 2
      });
    }
    setShowRoomTypeModal(true);
  };

  const handleSaveRoomType = async () => {
    try {
      setLoading(true);
      
      const payload = {
        ...roomTypeForm,
        base_price: parseInt(roomTypeForm.base_price.replace(/[^0-9]/g, '')) || 0
      };

      if (editingRoomType) {
        await api.put(`/room-types/${editingRoomType.id}`, payload);
        showSuccess('Tipe kamar berhasil diperbarui!');
      } else {
        await api.post('/room-types', payload);
        showSuccess('Tipe kamar berhasil ditambahkan!');
      }

      setShowRoomTypeModal(false);
      fetchSettingsData();
    } catch (err) {
      console.error('Error saving room type:', err);
      alert(err.response?.data?.message || 'Gagal menyimpan tipe kamar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoomType = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tipe kamar ini?')) return;

    try {
      await api.delete(`/room-types/${id}`);
      showSuccess('Tipe kamar berhasil dihapus!');
      fetchSettingsData();
    } catch (err) {
      console.error('Error deleting room type:', err);
      alert('Gagal menghapus tipe kamar');
    }
  };

  // ====== HANDLERS - AMENITIES ======
  const openAmenityModal = (amenity = null) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setAmenityForm({
        name: amenity.name || '',
        icon: amenity.icon || '',
        description: amenity.description || ''
      });
    } else {
      setEditingAmenity(null);
      setAmenityForm({
        name: '',
        icon: '',
        description: ''
      });
    }
    setShowAmenityModal(true);
  };

  const handleSaveAmenity = async () => {
    try {
      setLoading(true);
      
      if (editingAmenity) {
        await api.put(`/amenities/${editingAmenity.id}`, amenityForm);
        showSuccess('Fasilitas berhasil diperbarui!');
      } else {
        await api.post('/amenities', amenityForm);
        showSuccess('Fasilitas berhasil ditambahkan!');
      }

      setShowAmenityModal(false);
      fetchSettingsData();
    } catch (err) {
      console.error('Error saving amenity:', err);
      alert('Gagal menyimpan fasilitas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAmenity = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) return;

    try {
      await api.delete(`/amenities/${id}`);
      showSuccess('Fasilitas berhasil dihapus!');
      fetchSettingsData();
    } catch (err) {
      console.error('Error deleting amenity:', err);
      alert('Gagal menghapus fasilitas');
    }
  };

  // ====== HANDLERS - USER PROFILE ======
  const handleUserProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUserProfile = async () => {
    try {
      setLoading(true);
      await api.put('/users/profile', userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      showSuccess('Profil pengguna berhasil diperbarui!');
    } catch (err) {
      console.error('Error saving user profile:', err);
      alert('Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  // ====== HANDLERS - PASSWORD ======
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    try {
      setLoading(true);
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showSuccess('Password berhasil diubah!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      alert(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  // ====== HANDLERS - NOTIFICATIONS ======
  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    try {
      await api.put('/settings/notifications', notifications);
      showSuccess('Pengaturan notifikasi berhasil disimpan!');
    } catch (err) {
      console.error('Error saving notifications:', err);
    }
  };

  // ====== RENDER ======
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan sistem dan profil hotel Grand Nusantara</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px min-w-max">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4" /> Profil Hotel
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'rooms'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BedDouble className="w-4 h-4" /> Tipe Kamar
            </button>
            <button
              onClick={() => setActiveTab('amenities')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'amenities'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wifi className="w-4 h-4" /> Fasilitas
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'account'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4" /> Akun Saya
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4" /> Notifikasi
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* PROFIL HOTEL TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Hotel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Hotel</label>
                    <input
                      type="text"
                      name="name"
                      value={hotelProfile.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                    <textarea
                      name="address"
                      value={hotelProfile.address}
                      onChange={handleProfileChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Masukkan alamat lengkap hotel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={hotelProfile.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="021-12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={hotelProfile.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="info@grandnusantara.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={hotelProfile.website}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="https://grandnusantara.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jam Check-In</label>
                    <input
                      type="time"
                      name="checkInTime"
                      value={hotelProfile.checkInTime}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jam Check-Out</label>
                    <input
                      type="time"
                      name="checkOutTime"
                      value={hotelProfile.checkOutTime}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <textarea
                      name="description"
                      value={hotelProfile.description}
                      onChange={handleProfileChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Deskripsi tentang hotel..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TIPE KAMAR TAB */}
          {activeTab === 'rooms' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Manajemen Tipe Kamar</h2>
                <button
                  onClick={() => openRoomTypeModal()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Tambah Tipe Kamar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomTypes.map((type) => (
                  <div key={type.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{type.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRoomTypeModal(type)}
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomType(type.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{type.description || '-'}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Harga:</span>
                      <span className="font-bold text-yellow-700">{formatCurrency(type.base_price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {roomTypes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BedDouble className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada tipe kamar</p>
                </div>
              )}
            </div>
          )}

          {/* FASILITAS TAB */}
          {activeTab === 'amenities' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Manajemen Fasilitas</h2>
                <button
                  onClick={() => openAmenityModal()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Tambah Fasilitas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{amenity.name}</h3>
                        <p className="text-xs text-gray-500">{amenity.description || '-'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAmenityModal(amenity)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAmenity(amenity.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {amenities.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Wifi className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada fasilitas</p>
                </div>
              )}
            </div>
          )}

          {/* AKUN SAYA TAB */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* User Profile */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Profil Pengguna</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      value={userProfile.name}
                      onChange={handleUserProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userProfile.email}
                      onChange={handleUserProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userProfile.phone}
                      onChange={handleUserProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                    <input
                      type="text"
                      name="position"
                      value={userProfile.position}
                      onChange={handleUserProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveUserProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Profil
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-600" />
                  Ubah Password
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    <Lock className="w-4 h-4" />
                    Ubah Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFIKASI TAB */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pengaturan Notifikasi</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Notifikasi Email</h3>
                      <p className="text-sm text-gray-500">Terima notifikasi melalui email untuk aktivitas penting</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Alert Reservasi Baru</h3>
                      <p className="text-sm text-gray-500">Dapatkan notifikasi saat ada reservasi baru masuk</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.newReservationAlert}
                      onChange={() => handleNotificationChange('newReservationAlert')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Pengingat Check-In</h3>
                      <p className="text-sm text-gray-500">Ingatkan tamu yang akan check-in hari ini</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.checkInReminder}
                      onChange={() => handleNotificationChange('checkInReminder')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL - ROOM TYPE */}
      {showRoomTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRoomType ? 'Edit Tipe Kamar' : 'Tambah Tipe Kamar'}
              </h2>
              <button onClick={() => setShowRoomTypeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tipe Kamar</label>
                <input
                  type="text"
                  value={roomTypeForm.name}
                  onChange={(e) => setRoomTypeForm({...roomTypeForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Contoh: Deluxe Room"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harga per Malam</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                  <input
                    type="text"
                    value={roomTypeForm.base_price}
                    onChange={(e) => setRoomTypeForm({...roomTypeForm, base_price: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas Maksimal</label>
                <input
                  type="number"
                  value={roomTypeForm.max_occupancy}
                  onChange={(e) => setRoomTypeForm({...roomTypeForm, max_occupancy: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={roomTypeForm.description}
                  onChange={(e) => setRoomTypeForm({...roomTypeForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Deskripsi tipe kamar..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowRoomTypeModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRoomType}
                disabled={loading || !roomTypeForm.name || !roomTypeForm.base_price}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : editingRoomType ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - AMENITY */}
      {showAmenityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAmenity ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
              </h2>
              <button onClick={() => setShowAmenityModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Fasilitas</label>
                <input
                  type="text"
                  value={amenityForm.name}
                  onChange={(e) => setAmenityForm({...amenityForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Contoh: WiFi, AC, Kolam Renang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Opsional)</label>
                <input
                  type="text"
                  value={amenityForm.icon}
                  onChange={(e) => setAmenityForm({...amenityForm, icon: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nama icon (FontAwesome/Material)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={amenityForm.description}
                  onChange={(e) => setAmenityForm({...amenityForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Deskripsi fasilitas..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAmenityModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAmenity}
                disabled={loading || !amenityForm.name}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : editingAmenity ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;