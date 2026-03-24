import { Outlet, Link, useLocation } from 'react-router-dom';

const InventarioLayout = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Stock Actual', path: '/inventario/stock' },
    { name: 'Historial de Movimientos', path: '/inventario/movimientos' },
    { name: 'Catálogo de Productos', path: '/inventario/productos' },
    { name: 'Por Departamento', path: '/inventario/departamentos' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
        <p className="text-slate-500 mt-1">Controla el stock de productos por sucursal y registra movimientos.</p>
      </div>

      <div className="px-4 md:px-6 border-b border-slate-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 md:space-x-8">
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

      <div className="p-4 md:p-6 flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

export default InventarioLayout;
