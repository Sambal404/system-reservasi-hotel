// /src/components/SideBar.jsx
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BedDouble,
    Users,
    Calendar,
    ArrowDownLeft,
    ArrowUpRight,
    FileText,
    Settings,
    LogOut
} from 'lucide-react';

function SideBar() {
    const navLinkClass = ({ isActive }) => 
        isActive
            ? "flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm bg-gradient-to-r from-[#C5A059] to-[#DFC28E] text-[#07111E] font-medium shadow-md" 
            : "flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm text-gray-300 hover:bg-white/5";

    return (
        <aside className="w-2/12 h-screen bg-[#07111e] flex flex-col justify-between py-6 fixed left-0 top-0 text-white z-20">
            <div>
                <div className="mb-8 text-center px-4">
                    <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold text-[#07111E]">
                    ✦
                    </div>
                    <h1 className="text-[11px] tracking-widest font-serif text-[#C5A059]">GRAND NUSANTARA</h1>
                    <p className="text-[9px] tracking-widest text-[#C5A059]">HOTEL ✩✩✩✩✩</p>
                </div>

                {/* Navigation Menu */}
                <nav className="w-full px-3 space-y-1">
                    <NavLink to="/dashboard" className={navLinkClass}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                    <NavLink to="/rooms" className={navLinkClass}>
                        <BedDouble size={18} /> Room Management
                    </NavLink>
                    <NavLink to="/guests" className={navLinkClass}>
                        <Users size={18} /> Guest Directory
                    </NavLink>
                    <NavLink to="/reservations" className={navLinkClass}>
                        <Calendar size={18} /> Reservations
                    </NavLink>
                    <NavLink to="/check-in" className={navLinkClass}>
                        <ArrowDownLeft size={18} /> Check-In
                    </NavLink>
                    <NavLink to="/check-out" className={navLinkClass}>
                        <ArrowUpRight size={18} /> Check-Out
                    </NavLink>
                    <NavLink to="/reports" className={navLinkClass}>
                        <FileText size={18} /> Reports
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClass}>
                        <Settings size={18} /> Settings
                    </NavLink>
                </nav>
            </div>

            {/* Logout Button */}
            <div className="px-3">
                <NavLink to="/logout" className={navLinkClass}>
                    <LogOut size={18} /> Sign Out
                </NavLink>
            </div>
        </aside>
    );
}

export default SideBar;