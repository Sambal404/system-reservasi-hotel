// src/components/TopBar.jsx
import { Search, Bell } from 'lucide-react';
import hertaProfile from '../assets/herta-0.png'; // Sesuaikan jalur impor gambar Anda

export default function TopBar() {
  return (
    <header className="ml-[16.666667%] w-[83.333333%] h-[72px] bg-slate-50 px-6 fixed top-0 right-0 z-10 box-border flex justify-between items-center">
      
      {/* SearchBar */}
      <div className="relative w-108">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input 
          type="text" 
          placeholder="Cari sesuatu..." 
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      {/* UserBlock */}
      <div className="h-full flex items-end pb-3">
        <div className="flex items-center space-x-4">
          {/* Tombol Notifikasi */}
          <button className="relative text-slate-600 hover:text-slate-800 flex items-center justify-center p-1 mb-1">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profil Pengguna (UserPict 48px) */}
          <div className="flex items-center space-x-3 pl-4 border-slate-200">
            <div className="w-[48px] h-[48px] rounded-full bg-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
              <img src={hertaProfile} alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">FO_Dewi</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Staff</p>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}