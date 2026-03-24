import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getSpendingTrend, getTopSuppliers, getApprovalTime } from '../services/reports.service';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell,
} from 'recharts';
import { 
  TrendingUp, Users, AlertCircle, DollarSign, Clock, ArrowRight, 
  ShoppingCart, Package, ListChecks
} from 'lucide-react';

const ROL_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  COMPRAS: 'Compras / Pagos',
  CONTRALOR: 'Contraloría',
  ALMACENISTA: 'Almacenista',
  SOLICITANTE: 'Solicitante',
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const SkeletonNum = () => (
  <div className="skeleton h-9 w-16 mt-1" />
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [avgTime, setAvgTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, sup, a] = await Promise.all([
          getDashboardStats(),
          getSpendingTrend(),
          getTopSuppliers(),
          getApprovalTime()
        ]);
        setStats(s);
        setTrend(t);
        setTopSuppliers(sup);
        setAvgTime(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? '☀️ Buenos días' : hora < 18 ? '🌤️ Buenas tardes' : '🌙 Buenas noches';

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="animate-fade-in-up stagger-1 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-emerald-400 text-sm font-bold tracking-wider uppercase">{saludo}</p>
            <h1 className="text-3xl font-extrabold tracking-tight">{user?.nombre}</h1>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-md bg-white/10 border border-white/20 text-xs font-bold backdrop-blur-md">
                {ROL_LABELS[user?.rol ?? ''] ?? user?.rol}
              </span>
              <span className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                Sesión Activa
              </span>
            </div>
          </div>
          <div className="hidden md:flex p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
             <div className="text-right">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tiemp. Aprobación Promedio</p>
               <p className="text-2xl font-mono font-bold text-emerald-400">{avgTime} hrs</p>
             </div>
             <div className="ml-4 p-2 bg-emerald-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-emerald-400" />
             </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Link
          to="/solicitudes"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
              Aprobaciones
            </span>
          </div>
          <div className="mt-4">
            {loading ? <SkeletonNum /> : <h4 className="text-3xl font-black text-slate-800 tabular-nums">{stats?.scPendientes ?? 0}</h4>}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">S.C. Pendientes</p>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
          to="/ordenes"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">
              Tránsito
            </span>
          </div>
          <div className="mt-4">
            {loading ? <SkeletonNum /> : <h4 className="text-3xl font-black text-slate-800 tabular-nums">{stats?.ocEnTransito ?? 0}</h4>}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">O.C. Activas</p>
          </div>
        </Link>

        {/* Card 3 */}
        <Link
          to="/inventario/stock"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-lg transition-colors ${
              (stats?.alertasInventario ?? 0) > 0 ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-tighter ${
              (stats?.alertasInventario ?? 0) > 0 ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-400 bg-slate-50 border-slate-200'
            }`}>
              Inventario
            </span>
          </div>
          <div className="mt-4">
            {loading ? <SkeletonNum /> : <h4 className={`text-3xl font-black tabular-nums ${(stats?.alertasInventario ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{stats?.alertasInventario ?? 0}</h4>}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Stock Crítico</p>
          </div>
        </Link>

        {/* Card 4 */}
        <Link
          to="/reportes"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
              Finanzas
            </span>
          </div>
          <div className="mt-4">
            {loading ? <SkeletonNum /> : <h4 className="text-xl font-black text-slate-800 leading-tight truncate">{fmt(stats?.gastosEsteMes ?? 0)}</h4>}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Gasto Mensual</p>
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tendencia de Gasto</h3>
             </div>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Últimos 6 meses</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <ReTooltip 
                  formatter={(val: any) => [fmt(Number(val)), 'Total']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Concentración Proveedores</h3>
             </div>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Top 5 por Gasto</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around h-[250px]">
            <div className="h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSuppliers}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topSuppliers.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(val: any) => fmt(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-2">
              {topSuppliers.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1 last:border-0">
                   <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 font-medium truncate">{s.name}</span>
                   </div>
                   <span className="font-bold text-slate-800 ml-2">{fmt(s.value)}</span>
                </div>
              ))}
              {topSuppliers.length === 0 && <p className="text-center text-slate-400 text-xs py-10">Sin datos suficientes</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="animate-fade-in-up stagger-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Acciones Críticas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/solicitudes/nueva"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30
              hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">Nueva Solicitud</div>
              <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-tight">Empezar flujo</div>
            </div>
            <ArrowRight className="ml-auto w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/ordenes"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-blue-100 bg-blue-50/30
              hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">Validar Órdenes</div>
              <div className="text-[10px] uppercase font-bold text-blue-600 tracking-tight">Revisar historial</div>
            </div>
            <ArrowRight className="ml-auto w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/inventario/stock"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50
              hover:bg-slate-100 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-800/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">Control Stock</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">Inventario físico</div>
            </div>
            <ArrowRight className="ml-auto w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
