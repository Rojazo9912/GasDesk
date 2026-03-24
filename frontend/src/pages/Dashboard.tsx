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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-600/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{saludo}</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.nombre}</h1>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-sm font-medium text-white">{ROL_LABELS[user?.rol ?? ''] ?? user?.rol}</span>
            </div>
          </div>
          <div className="hidden sm:block text-6xl opacity-20 select-none">⛽</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/solicitudes"
          className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">📋</div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Pendientes
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 tabular-nums">
            {loading ? <span className="animate-pulse">—</span> : (stats?.scPendientes ?? 0)}
          </div>
          <p className="text-sm text-slate-500 mt-1">Solicitudes de compra</p>
          <div className="mt-3 text-xs text-emerald-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
            Ver solicitudes <span>→</span>
          </div>
        </Link>

        <Link
          to="/ordenes"
          className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">🚚</div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              En tránsito
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 tabular-nums">
            {loading ? <span className="animate-pulse">—</span> : (stats?.ocEnTransito ?? 0)}
          </div>
          <p className="text-sm text-slate-500 mt-1">Órdenes de compra</p>
          <div className="mt-3 text-xs text-emerald-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
            Ver órdenes <span>→</span>
          </div>
        </Link>

        <Link
          to="/inventario/stock"
          className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">⚠️</div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              !loading && (stats?.alertasInventario ?? 0) > 0
                ? 'text-rose-600 bg-rose-50 border-rose-100'
                : 'text-slate-500 bg-slate-50 border-slate-100'
            }`}>
              {!loading && (stats?.alertasInventario ?? 0) > 0 ? 'Atención' : 'Normal'}
            </span>
          </div>
          <div className={`text-3xl font-extrabold tabular-nums ${
            !loading && (stats?.alertasInventario ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'
          }`}>
            {loading ? <span className="animate-pulse">—</span> : (stats?.alertasInventario ?? 0)}
          </div>
          <p className="text-sm text-slate-500 mt-1">Alertas de inventario</p>
          <div className="mt-3 text-xs text-emerald-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
            Ver inventario <span>→</span>
          </div>
        </Link>

        <Link
          to="/reportes"
          className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">💰</div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Este mes
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 leading-tight mt-1">
            {loading ? <span className="animate-pulse">—</span> : fmt(stats?.gastosEsteMes ?? 0)}
          </div>
          <p className="text-sm text-slate-500 mt-1">Gasto en órdenes</p>
          <div className="mt-3 text-xs text-emerald-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
            Ver reportes <span>→</span>
          </div>
        </Link>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">⚡ Acciones rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/solicitudes/nueva"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">✍️</span>
            <div>
              <div className="font-semibold text-slate-700 text-sm">Nueva Solicitud</div>
              <div className="text-xs text-slate-400">Crear solicitud de compra</div>
            </div>
          </Link>
          <Link
            to="/ordenes"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📦</span>
            <div>
              <div className="font-semibold text-slate-700 text-sm">Órdenes de Compra</div>
              <div className="text-xs text-slate-400">Ver y gestionar OCs</div>
            </div>
          </Link>
          <Link
            to="/inventario/stock"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🗃️</span>
            <div>
              <div className="font-semibold text-slate-700 text-sm">Inventario</div>
              <div className="text-xs text-slate-400">Revisar stock actual</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
