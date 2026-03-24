import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'COMPRAS', 'CONTRALOR', 'ALMACENISTA', 'SOLICITANTE'];
  const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
  const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'COMPRAS', 'CONTRALOR', 'ALMACENISTA'];

  const allMenuItems = [
    { label: 'Dashboard',             path: '/',                roles: ALL_ROLES },
    { label: 'Solicitudes de Compra', path: '/solicitudes',     roles: ALL_ROLES },
    { label: 'Órdenes de Compra',     path: '/ordenes',         roles: STAFF_ROLES },
    { label: 'Inventario',            path: '/inventario',      roles: STAFF_ROLES },
    { label: 'Reportes',              path: '/reportes',        roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'COMPRAS', 'CONTRALOR'] },
    { label: 'Empresas',              path: '/admin/empresas',  roles: ['SUPER_ADMIN'] },
    { label: 'Configuración',         path: '/configuracion',   roles: ADMIN_ROLES },
  ];

  const menuItems = allMenuItems.filter(item => user?.rol && item.roles.includes(user.rol));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            GasDesk
          </span>
          {/* Botón cerrar en móvil */}
          <button
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
          {/* Botón hamburger móvil */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-base md:text-lg font-semibold text-slate-800 capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).split('/')[0]}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
