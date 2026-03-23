import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/reports.service';

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-1">
          Bienvenido, {user?.nombre}
        </h3>
        <p className="text-slate-500 text-sm">
          Rol actual:{' '}
          <span className="font-medium text-emerald-600 px-2 py-1 bg-emerald-50 rounded-md text-sm">
            {user?.rol}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/solicitudes"
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Solicitudes Pendientes</p>
          <div className="text-3xl font-bold text-slate-800">
            {loading ? '—' : (stats?.scPendientes ?? 0)}
          </div>
          <p className="text-xs text-amber-600 mt-2">Pendientes de aprobación</p>
        </Link>

        <Link
          to="/ordenes"
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Órdenes en Tránsito</p>
          <div className="text-3xl font-bold text-slate-800">
            {loading ? '—' : (stats?.ocEnTransito ?? 0)}
          </div>
          <p className="text-xs text-blue-600 mt-2">Enviadas / parcialmente recibidas</p>
        </Link>

        <Link
          to="/inventario/stock"
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Alertas de Inventario</p>
          <div className={`text-3xl font-bold ${!loading && (stats?.alertasInventario ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {loading ? '—' : (stats?.alertasInventario ?? 0)}
          </div>
          <p className="text-xs text-rose-500 mt-2">Productos bajo stock mínimo</p>
        </Link>

        <Link
          to="/reportes"
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Gasto Este Mes</p>
          <div className="text-2xl font-bold text-slate-800 leading-tight mt-1">
            {loading ? '—' : fmt(stats?.gastosEsteMes ?? 0)}
          </div>
          <p className="text-xs text-slate-400 mt-2">En órdenes de compra emitidas</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
