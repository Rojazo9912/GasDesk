import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/reports.service';

const ROL_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  COMPRAS: 'Compras / Pagos',
  CONTRALOR: 'Contraloría',
  ALMACENISTA: 'Almacenista',
  SOLICITANTE: 'Solicitante',
};

const SkeletonNum = () => (
  <div className="skeleton h-9 w-16 mt-1" />
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? '☀️ Buenos días' : hora < 18 ? '🌤️ Buenas tardes' : '🌙 Buenas noches';

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="animate-fade-in-up stagger-1 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-600/25">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{saludo}</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.nombre}</h1>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-sm shadow-emerald-300" />
              <span className="text-sm font-semibold text-white">{ROL_LABELS[user?.rol ?? ''] ?? user?.rol}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 opacity-25 select-none">
            <span className="text-7xl leading-none">⛽</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Link
          to="/solicitudes"
          className="animate-fade-in-up stagger-2 group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm
            hover:shadow-lg hover:-translate-y-1.5 hover:border-amber-200 transition-all duration-250 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              📋
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              Pendientes
            </span>
          </div>
          {loading ? <SkeletonNum /> : (
            <div className="text-3xl font-extrabold text-slate-800 tabular-nums">{stats?.scPendientes ?? 0}</div>
          )}
          <p className="text-sm text-slate-500 mt-1">Solicitudes de compra</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:gap-2 transition-all duration-200">
            Ver solicitudes <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
          to="/ordenes"
          className="animate-fade-in-up stagger-3 group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm
            hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-250 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              🚚
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              En tránsito
            </span>
          </div>
          {loading ? <SkeletonNum /> : (
            <div className="text-3xl font-extrabold text-slate-800 tabular-nums">{stats?.ocEnTransito ?? 0}</div>
          )}
          <p className="text-sm text-slate-500 mt-1">Órdenes de compra</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all duration-200">
            Ver órdenes <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </Link>

        {/* Card 3 */}
        <Link
          to="/inventario/stock"
          className="animate-fade-in-up stagger-4 group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm
            hover:shadow-lg hover:-translate-y-1.5 hover:border-rose-200 transition-all duration-250 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${
              !loading && (stats?.alertasInventario ?? 0) > 0
                ? 'bg-rose-50 border border-rose-100'
                : 'bg-slate-50 border border-slate-100'
            }`}>
              ⚠️
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              !loading && (stats?.alertasInventario ?? 0) > 0
                ? 'text-rose-600 bg-rose-50 border-rose-100'
                : 'text-slate-500 bg-slate-50 border-slate-100'
            }`}>
              {!loading && (stats?.alertasInventario ?? 0) > 0 ? 'Atención' : 'Normal'}
            </span>
          </div>
          {loading ? <SkeletonNum /> : (
            <div className={`text-3xl font-extrabold tabular-nums ${
              (stats?.alertasInventario ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'
            }`}>{stats?.alertasInventario ?? 0}</div>
          )}
          <p className="text-sm text-slate-500 mt-1">Alertas de inventario</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-rose-500 group-hover:gap-2 transition-all duration-200">
            Ver inventario <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </Link>

        {/* Card 4 */}
        <Link
          to="/reportes"
          className="animate-fade-in-up stagger-5 group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm
            hover:shadow-lg hover:-translate-y-1.5 hover:border-emerald-200 transition-all duration-250 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              💰
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Este mes
            </span>
          </div>
          {loading ? <SkeletonNum /> : (
            <div className="text-xl font-extrabold text-slate-800 leading-tight">{fmt(stats?.gastosEsteMes ?? 0)}</div>
          )}
          <p className="text-sm text-slate-500 mt-1">Gasto en órdenes</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all duration-200">
            Ver reportes <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </Link>
      </div>

      {/* Accesos rápidos */}
      <div className="animate-fade-in-up stagger-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">⚡ Acciones rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/solicitudes/nueva"
            className="group flex items-center gap-3.5 p-4 rounded-xl border-2 border-dashed border-emerald-200
              hover:border-emerald-400 hover:bg-emerald-50 active:scale-98 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl
              group-hover:scale-110 group-hover:bg-emerald-200 transition-all duration-200 shadow-sm flex-shrink-0">
              ✍️
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-sm">Nueva Solicitud</div>
              <div className="text-xs text-slate-400 mt-0.5">Crear solicitud de compra</div>
            </div>
          </Link>
          <Link
            to="/ordenes"
            className="group flex items-center gap-3.5 p-4 rounded-xl border-2 border-dashed border-blue-200
              hover:border-blue-400 hover:bg-blue-50 active:scale-98 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl
              group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-200 shadow-sm flex-shrink-0">
              📦
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-sm">Órdenes de Compra</div>
              <div className="text-xs text-slate-400 mt-0.5">Ver y gestionar OCs</div>
            </div>
          </Link>
          <Link
            to="/inventario/stock"
            className="group flex items-center gap-3.5 p-4 rounded-xl border-2 border-dashed border-amber-200
              hover:border-amber-400 hover:bg-amber-50 active:scale-98 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl
              group-hover:scale-110 group-hover:bg-amber-200 transition-all duration-200 shadow-sm flex-shrink-0">
              🗃️
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-sm">Inventario</div>
              <div className="text-xs text-slate-400 mt-0.5">Revisar stock actual</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
