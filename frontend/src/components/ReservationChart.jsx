// /src/components/ReservationChart.jsx

// Import recharts
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Function helper untuk mengubah format "YYYY-MM-DD" menjadi "DD MMM" ("31 Jul")
const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

function ReservationChart({ data = [] }) {
  // Mapping data dari api/dashboard 
  const formattedData = data.map(item => ({
    day: formatShortDate(item.tanggal), 
    reservasi: item.reservation_count,
    checkin: item.check_in_count,
    checkout: item.check_out_count 
  }));

  return (
    <div className="col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-800">Grafik Operasional (7 Hari Terakhir)</h3>
        <div className="flex items-center space-x-4 text-xs">
          {/* Reservasi */}
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Reservasi</span>
          </div>
          {/* Check-in */}
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Check in</span>
          </div>
          {/* Check-out */}
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Check out</span>
          </div>
        </div>
      </div>

      {/* Area Line Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
            <Tooltip />
            
            {/* Garis Reservasi */}
            <Line 
              type="monotone" 
              dataKey="reservasi" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#3b82f6' }} 
              activeDot={{ r: 5 }} 
            />
            
            {/* Garis Check-in */}
            <Line 
              type="monotone" 
              dataKey="checkin" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#f59e0b' }} 
              activeDot={{ r: 5 }} 
            />

            {/* Garis Check-out */}
            <Line 
              type="monotone" 
              dataKey="checkout" 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#ef4444' }} 
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReservationChart;