// src/components/RoomStatusChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Tersedia', value: 120, color: '#22c55e' },     // Hijau (Emerald)
  { name: 'Terisi', value: 118, color: '#ef4444' },       // Merah
  { name: 'Maintenance', value: 12, color: '#f59e0b' },   // Kuning/Oranye (Amber)
];

export default function RoomStatusChart() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <h3 className="text-xs font-bold text-slate-800 mb-2">Status Kamar</h3>
      
      {/* Container Grafik & Legenda */}
      <div className="flex items-center justify-between">
        {/* Donut Chart */}
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Keterangan Legenda di Samping Kanan */}
        <div className="space-y-2 text-xs text-slate-600 pr-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-medium">Tersedia</span>
            <span className="text-slate-400">120 (48%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span className="font-medium">Terisi</span>
            <span className="text-slate-400">118 (47.2%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="font-medium">Maintenance</span>
            <span className="text-slate-400">12 (4.8%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}