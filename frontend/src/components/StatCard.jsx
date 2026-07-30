// src/components/StatCard.jsx
export default function StatCard({ title, value, subtext, icon, subtextColor = "text-slate-400", iconBg = "bg-blue-50 text-blue-600" }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-slate-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        <p className={`text-[10px] font-medium mt-1 ${subtextColor}`}>{subtext}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}