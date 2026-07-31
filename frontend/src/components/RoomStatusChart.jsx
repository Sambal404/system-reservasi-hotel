// src/components/RoomStatusChart.jsx

// Import recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function RoomStatusChart({ data = {} }) {
  // Nilai Default
  const roomData = data || {
    total_rooms: 0,
    available_rooms: 0,
    occupied_rooms: 0,
    maintenance_rooms: 0
  };

  const total = roomData.total_rooms || 1; 

  // Hitung percentage
  const availablePercent = ((roomData.available_rooms / total) * 100).toFixed(1);
  const occupiedPercent = ((roomData.occupied_rooms / total) * 100).toFixed(1);
  const maintenancePercent = ((roomData.maintenance_rooms / total) * 100).toFixed(1);

  // Mapping data untuk Recharts
  const chartData = [
    { name: 'Tersedia', value: roomData.available_rooms, color: '#22c55e' },
    { name: 'Terisi', value: roomData.occupied_rooms, color: '#ef4444' },
    { name: 'Maintenance', value: roomData.maintenance_rooms, color: '#f59e0b' },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <h3 className="text-xs font-bold text-slate-800 mb-2">Status Kamar</h3>
      
      {/* Container Grafik */}
      <div className="flex items-center justify-between">
        {/* Donut Chart */}
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Keterangan di sebelah kanan (Update: Dinamis) */}
        <div className="space-y-2 text-xs text-slate-600 pr-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-medium">Tersedia</span>
            <span className="text-slate-400">{roomData.available_rooms} ({availablePercent}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span className="font-medium">Terisi</span>
            <span className="text-slate-400">{roomData.occupied_rooms} ({occupiedPercent}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="font-medium">Maintenance</span>
            <span className="text-slate-400">{roomData.maintenance_rooms} ({maintenancePercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomStatusChart;