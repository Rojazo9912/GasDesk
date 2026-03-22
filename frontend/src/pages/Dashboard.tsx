import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Bienvenido, {user?.nombre}
        </h3>
        <p className="text-slate-500">
          Rol actual: <span className="font-medium text-emerald-600 px-2 py-1 bg-emerald-50 rounded-md text-sm">{user?.rol}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjetas simuladas del dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
          <p className="text-sm font-medium text-slate-500 mb-1">Solicitudes Pendientes</p>
          <div className="text-3xl font-bold text-slate-800">12</div>
          <p className="text-xs text-amber-600 mt-2">Requieren tu aprobación</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
          <p className="text-sm font-medium text-slate-500 mb-1">Órdenes en Tránsito</p>
          <div className="text-3xl font-bold text-slate-800">5</div>
          <p className="text-xs text-blue-600 mt-2">Esperando recepción física</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
          <p className="text-sm font-medium text-slate-500 mb-1">Alertas de Inventario</p>
          <div className="text-3xl font-bold text-rose-600">3</div>
          <p className="text-xs text-rose-500 mt-2">Productos bajo stock mínimo</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
