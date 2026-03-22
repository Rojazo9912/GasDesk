import { Outlet, Link, useLocation } from 'react-router-dom';

const ConfiguracionLayout = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Mi Empresa', path: '/configuracion/empresa' },
    { name: 'Sucursales', path: '/configuracion/sucursales' },
    { name: 'Usuarios y roles', path: '/configuracion/usuarios' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 mt-1">Administra los detalles de tu empresa, sucursales y equipo.</p>
      </div>

      <div className="px-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? 'border-emerald-500 text-emerald-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

export default ConfiguracionLayout;
