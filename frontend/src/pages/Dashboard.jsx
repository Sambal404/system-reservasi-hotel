// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import api from "../api/api"

// Components
import StatCard from '../components/StatCard';
import ReservationChart from '../components/ReservationChart';
import RoomStatusChart from '../components/RoomStatusChart';
import RecentReservationTable from '../components/RecentReservationTable';

// Import Icon SVG dari lucide-react
import { 
  Building2, 
  BedDouble, 
  KeyRound, 
  Wrench, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CalendarDays, 
  UsersRound 
} from 'lucide-react';

// Helper untuk menghitung Maintenance
const getMaintenanceStatus = (maintenanceCount, totalRooms) => {
  if (!totalRooms || totalRooms === 0) return { subtext: "0% dari total", color: "text-slate-400" };
  const percentVal = (maintenanceCount / totalRooms) * 100;
  
  let color = "text-emerald-600"; 
  if (percentVal > 20) {
    color = "text-rose-500";     
  } else if (percentVal > 5) {
    color = "text-amber-500";    
  }

  return {
    subtext: `${percentVal.toFixed(1)}% dari total`,
    color: color
  };
};

// Helper untuk Available & Occupied
const getRoomStatus = (count, totalRooms) => {
  if (!totalRooms || totalRooms === 0) return { subtext: "0% dari total", color: "text-slate-400" };
  const percentVal = (count / totalRooms) * 100;

  let color = "text-amber-500"; 
  if (percentVal >= 50) {
    color = "text-emerald-600"; 
  } else if (percentVal < 20) {
    color = "text-rose-500";    
  }

  return {
    subtext: `${percentVal.toFixed(1)}% dari total`,
    color: color
  };
};

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard');
                if (response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch(error) {
                console.error('Gagal mengambil data dashboard', error);                
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-6 text-slate-500 text-sm">Memuat data dashboard...</div>;
    }

    const { room_summary, reservation_summary, guest_summary, daily_summary, recent_reservations } = dashboardData;

    // Kalkulasi helper untuk kartu kamar
    const availableStatus = getRoomStatus(room_summary?.available_rooms, room_summary?.total_rooms);
    const occupiedStatus = getRoomStatus(room_summary?.occupied_rooms, room_summary?.total_rooms);
    const maintenanceStatus = getMaintenanceStatus(room_summary?.maintenance_rooms, room_summary?.total_rooms);

    return (
        <>
        {/* Judul Halaman */}
        <h2 className="text-sm font-bold text-slate-800 tracking-wider">DASHBOARD</h2>

        {/* Baris 1: Kartu Statistik Kamar */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            title="Total Kamar" 
            value={room_summary?.total_rooms} 
            subtext="Semua Kamar" 
            subtextColor="text-slate-400"
            icon={<Building2 size={20} />} 
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard 
            title="Kamar Tersedia" 
            value={room_summary?.available_rooms} 
            subtext={availableStatus.subtext} 
            subtextColor={availableStatus.color}
            icon={<BedDouble size={20} />} 
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard 
            title="Kamar Terisi" 
            value={room_summary?.occupied_rooms} 
            subtext={occupiedStatus.subtext} 
            subtextColor={occupiedStatus.color}
            icon={<KeyRound size={20} />} 
            iconBg="bg-red-50 text-red-500"
          />
          <StatCard 
            title="Maintenance" 
            value={room_summary?.maintenance_rooms} 
            subtext={maintenanceStatus.subtext} 
            subtextColor={maintenanceStatus.color}
            icon={<Wrench size={20} />} 
            iconBg="bg-amber-50 text-amber-500"
          />
        </div>

        {/* Baris 2: Kartu Statistik Aktivitas */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            title="Check In Hari Ini" 
            value={reservation_summary?.expected_checkin}
            subtext="Tamu" 
            subtextColor="text-slate-400"
            icon={<ArrowDownLeft size={18} />} 
            iconBg="bg-blue-50 text-blue-500"
          />
          <StatCard 
            title="Check Out Hari Ini" 
            value={reservation_summary?.expected_checkout} 
            subtext="Tamu" 
            subtextColor="text-slate-400"
            icon={<ArrowUpRight size={18} />} 
            iconBg="bg-amber-50 text-amber-500"
          />
          <StatCard 
            title="Reservasi Hari Ini" 
            value={reservation_summary?.reservations_created_today}
            subtext="Reservasi baru" 
            subtextColor="text-slate-400"
            icon={<CalendarDays size={18} />} 
            iconBg="bg-purple-50 text-purple-500"
          />
          <StatCard 
            title="Tamu Menginap" 
            value={(guest_summary?.total_adult_guests || 0) + (guest_summary?.total_child_guests || 0)}
            subtext={`${guest_summary?.total_adult_guests || 0} Dewasa, ${guest_summary?.total_child_guests || 0} Anak`} 
            subtextColor="text-slate-400"
            icon={<UsersRound size={18} />} 
            iconBg="bg-blue-50 text-blue-500"
          />
        </div>

        {/* Grafik & Status Kamar */}
        <div className="grid grid-cols-3 gap-4">
          <ReservationChart data={daily_summary}/>
          <RoomStatusChart data={room_summary} />
        </div>

        {/* Tabel Reservasi Terbaru */}
        <RecentReservationTable reservations={recent_reservations}/>
        </>
    );
}

export default Dashboard;