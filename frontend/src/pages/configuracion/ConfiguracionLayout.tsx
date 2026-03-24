import { Outlet, Link, useLocation } from 'react-router-dom';

const ConfiguracionLayout = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Mi Empresa',          emoji: '🏢', path: '/configuracion/empresa' },
    { name: 'Sucursales',          emoji: '📍', path: '/configuracion/sucursales' },
    { name: 'Usuarios',            emoji: '👥', path: '/configuracion/usuarios' },
    { name: 'Flujos',              emoji: '🔄', path: '/configuracion/flujos' },
    { name: 'Proveedores',         emoji: '🤝', path: '/configuracion/proveedores' },
    { name: 'Departamentos',       emoji: '🏗️', path: '/configuracion/departamentos' },
    { name: 'Perfiles',            emoji: '🪪', path: '/configuracion/perfiles' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h1 className="text-xl font-bold text-slate-800">⚙️ Configuración</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Administra los detalles de tu empresa, sucursales y equipo.</p>
      </div>

      <div className="px-4 md:px-6 border-b border-slate-200 overflow-x-auto bg-white">
        <nav className="-mb-px flex gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`
                  whitespace-nowrap py-3.5 px-3 border-b-2 font-medium text-sm transition-all duration-200
                  flex items-center gap-1.5
                  ${isActive
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                <span className="text-base">{tab.emoji}</span>
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 md:p-6 flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

export default ConfiguracionLayout;
