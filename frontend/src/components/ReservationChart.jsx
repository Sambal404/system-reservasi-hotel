// src/components/ReservationChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { day: '15 Mei', reservasi: 10, checkin: 4 },
  { day: '16 Mei', reservasi: 22, checkin: 9 },
  { day: '17 Mei', reservasi: 35, checkin: 15 },
  { day: '18 Mei', reservasi: 22, checkin: 8 },
  { day: '19 Mei', reservasi: 25, checkin: 10 },
  { day: '20 Mei', reservasi: 21, checkin: 7 },
  { day: '21 Mei', reservasi: 33, checkin: 15 },
];

function ReservationChart() {
  return (
    <div className="col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header & Legenda */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-800">Grafik Reservasi (7 Hari Terakhir)</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Reservasi</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Check in</span>
          </div>
        </div>
      </div>

      {/* Area Line Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} />
            <Tooltip />
            {/* Garis Reservasi (Warna Biru) */}
            <Line 
              type="monotone" 
              dataKey="reservasi" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#3b82f6' }} 
              activeDot={{ r: 5 }} 
            />
            {/* Garis Check-in (Warna Kuning/Oranye) */}
            <Line 
              type="monotone" 
              dataKey="checkin" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#f59e0b' }} 
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReservationChart;