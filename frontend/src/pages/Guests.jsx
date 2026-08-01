import { useState, useEffect } from 'react';
import api from '../api/api';

const Guests = () => {
  // State untuk data guests
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter & search
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
  });

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);
  const [itemsPerPage] = useState(10);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_card: '',
    address: '',
    gender: 'male',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // State untuk delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ====== FETCH DATA ======
  const fetchGuests = async () => {
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

    //   const response = await api.get('/guests', { params });

    //   if (response.data.success) {
    //     setGuests(response.data.data);
    //     if (response.data.pagination) {
    //       setTotalPages(response.data.pagination.totalPages);
    //       setTotalGuests(response.data.pagination.total);
    //     }
    //   } else {
    //     setError(response.data.message || 'Gagal mengambil data tamu');
    //   }

        // Debug
        // Sesuaikan endpoint
        const response = await api.get('/guests');

        let allGuests = response.data.success ? response.data.data : [];
            // Debug
            console.log("DEBUG: ", allGuests);

        // Fitur search di lokal (frontend react);
        if (filters.search) {
            const keyword = filters.search.toLowerCase();
            allGuests = allGuests.find ? allGuests.filter(g => 
            (g.name && g.name.toLowerCase().includes(keyword)) ||
            (g.email && g.email.toLowerCase().includes(keyword)) ||
            (g.phone && g.phone.toLowerCase().includes(keyword)) ||
            (g.id_card && g.id_card.toLowerCase().includes(keyword))
            ) : allGuests;
        }

        // Fitur filter juga
        if (filters.gender) {
            allGuests = allGuests.filter(g => g.gender === filters.gender);
        }

        setGuests(allGuests);
        setTotalGuests(allGuests.length);


    } catch (err) {
      console.error('Error fetching guests:', err);
      setError(err.response?.data?.message || 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saat mount
  useEffect(() => {
    fetchGuests();
  }, [currentPage]);

  // Fetch saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchGuests();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // ====== HANDLE FILTER ======
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', gender: '' });
    setCurrentPage(1);
  };

  // ====== HANDLE FORM ======
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedGuest(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      id_card: '',
      address: '',
      gender: 'male',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (guest) => {
    setIsEditMode(true);
    setSelectedGuest(guest);
    setFormData({
      name: guest.name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      id_card: guest.id_card || '',
      address: guest.address || '',
      gender: guest.gender || 'male',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (isEditMode && selectedGuest) {
        // Update existing guest
        const response = await api.put(`/guests/${selectedGuest.id}`, formData);
        if (response.data.success) {
          closeModal();
          fetchGuests();
        } else {
          setFormError(response.data.message || 'Gagal mengupdate data');
        }
      } else {
        // Create new guest
        const response = await api.post('/guests', formData);
        if (response.data.success) {
          closeModal();
          fetchGuests();
        } else {
          setFormError(response.data.message || 'Gagal menambah data');
        }
      }
    } catch (err) {
      console.error('Error saving guest:', err);
      setFormError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setFormLoading(false);
    }
  };

  // ====== HANDLE DELETE ======
  const handleDelete = async (guest) => {
    setDeleteConfirm(guest);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await api.delete(`/guests/${deleteConfirm.id}`);
      if (response.data.success) {
        setDeleteConfirm(null);
        fetchGuests();
      } else {
        alert(response.data.message || 'Gagal menghapus data');
      }
    } catch (err) {
      console.error('Error deleting guest:', err);
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  // ====== HELPER FUNCTIONS ======
  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{4})(\d{4})(\d{3,})/, '$1-$2-$3');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenderIcon = (gender) => {
    return gender === 'female' ? '👩' : '👨';
  };

  // ====== RENDER ======
  if (loading && guests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Memuat data tamu...</span>
      </div>
    );
  }

  if (error && guests.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchGuests}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Guest Directory</h1>
          <p className="text-gray-600">Kelola data tamu hotel Grand Nusantara</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Tamu
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Tamu
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Cari nama, email, nomor telepon, atau KTP..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kelamin
            </label>
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
        </div>

        {(filters.search || filters.gender) && (
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Tamu</p>
              <p className="text-3xl font-bold mt-1">{totalGuests}</p>
            </div>
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Laki-laki</p>
              <p className="text-3xl font-bold mt-1">
                {guests.filter(g => g.gender === 'male').length}
              </p>
            </div>
            <span className="text-5xl"></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Perempuan</p>
              <p className="text-3xl font-bold mt-1">
                {guests.filter(g => g.gender === 'female').length}
              </p>
            </div>
            <span className="text-5xl">👩</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KTP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terdaftar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg">Tidak ada data tamu</p>
                  </td>
                </tr>
              ) : (
                guests.map((guest, index) => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                          {getGenderIcon(guest.gender)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{guest.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email || '-'}</div>
                      <div className="text-xs text-gray-500">{formatPhone(guest.phone)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guest.id_card || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={guest.address}>
                        {guest.address || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(guest.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(guest)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(guest)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
              Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
              {' '}-{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalGuests)}</span>
              {' '}dari <span className="font-medium">{totalGuests}</span> tamu
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====== MODAL FORM ====== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? 'Edit Data Tamu' : 'Tambah Tamu Baru'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08123456789"
                  />
                </div>

                {/* ID Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. KTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="id_card"
                    value={formData.id_card}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="16 digit nomor KTP"
                    maxLength={16}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Alamat lengkap"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isEditMode ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== DELETE CONFIRMATION MODAL ====== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hapus Data Tamu?
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus <strong>{deleteConfirm.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;