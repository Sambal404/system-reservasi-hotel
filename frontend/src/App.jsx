import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Komponen halaman sementara (Nanti akan dipisah ke folder /pages)
const DashboardPage = () => <div><h2>Tampilan Halaman Dashboard</h2></div>;
const RoomsPage = () => <div><h2>Tampilan Halaman Rooms</h2></div>;
const GuestsPage = () => <div><h2>Tampilan Halaman Guests</h2></div>;
const ReservationsPage = () => <div><h2>Tampilan Halaman Reservations</h2></div>;
const ProfilePage = () => <div><h2>Tampilan Halaman Profile</h2></div>;

function App() {
  return (
    <Router>
      <div className="d-flex vh-100 bg-light">

        {/* Sidebar di Kiri */}
        <Sidebar />

        {/* Area Kanan (Header + Konten + Footer) */}
        <div className="d-flex flex-column flex-grow-1 overflow-hidden">
          <Header />

          {/* Konten Utama (Bisa di-scroll jika isinya panjang) */}
          <main className="flex-grow-1 p-4 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          <Footer />
        </div>

      </div>
    </Router>
  );
}

export default App;
