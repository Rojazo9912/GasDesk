import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Solicitudes de Compra', path: '/solicitudes' },
    { label: 'Órdenes de Compra', path: '/ordenes' },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            GasDesk
          </span>
        </div>
        
        <div className="p-4 flex flex-col gap-2 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-md transition-colors ${
                (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-1">{user?.tenant?.nombre || 'Mi Empresa'}</div>
          <div className="text-xs text-slate-500 mb-3 truncate">{user?.email}</div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 hover:text-rose-300 rounded-md transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-auto p-6">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
