// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import SideBar from "./components/SideBar";
// import TopBar from "./components/TopBar";

//components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Reservations from "./pages/Reservations";
import CheckIn from "./pages/CheckIn";
import CheckOut from "./pages/CheckOut";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LogOut from "./pages/LogOut";
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          {/* Root / Direct to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> 
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/check-out" element={<CheckOut />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<LogOut />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
