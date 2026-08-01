// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';

// Pages
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Guests from './pages/Guests';
import Reservations from './pages/Reservations';
import CheckIn from './pages/CheckIn';
import CheckOut from './pages/CheckOut';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LogOut from './pages/LogOut';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FA] flex">
        {/* Sidebar */}
        <SideBar />

        {/* TopBar */}
        <div className="flex-1 ml-[16.666667%] flex flex-col">
          <TopBar />

          {/* Content Utama Area Halaman Dinamis */}
          <main className="p-6 mt-16">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/check-out" element={<CheckOut />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/logout" element={<LogOut />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
      
  );
}