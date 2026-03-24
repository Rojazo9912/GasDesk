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
    { label: 'Dashboard',             emoji: '🏠', path: '/',                roles: ALL_ROLES },
    { label: 'Solicitudes',           emoji: '📋', path: '/solicitudes',     roles: ALL_ROLES },
    { label: 'Órdenes de Compra',     emoji: '📦', path: '/ordenes',         roles: STAFF_ROLES },
    { label: 'Inventario',            emoji: '🗃️', path: '/inventario',      roles: STAFF_ROLES },
    { label: 'Reportes',              emoji: '📊', path: '/reportes',        roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'COMPRAS', 'CONTRALOR'] },
    { label: 'Empresas',              emoji: '🏢', path: '/admin/empresas',  roles: ['SUPER_ADMIN'] },
    { label: 'Configuración',         emoji: '⚙️', path: '/configuracion',   roles: ADMIN_ROLES },
  ];

  const menuItems = allMenuItems.filter(item => user?.rol && item.roles.includes(user.rol));

  const getPageTitle = () => {
    const path = location.pathname;
    const match = menuItems.find(i =>
      i.path === '/' ? path === '/' : path.startsWith(i.path)
    );
    return match ? `${match.emoji} ${match.label}` : 'GasDesk';
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto shadow-2xl
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛽</span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              GasDesk
            </span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white p-1 rounded transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'}
                `}
              >
                <span className={`text-lg transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                  {item.emoji}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{user?.nombre}</div>
                <div className="text-xs text-slate-500 truncate">{user?.tenant?.nombre || 'Mi Empresa'}</div>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors duration-200"
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-slate-700">{user?.nombre}</div>
              <div className="text-xs text-slate-400">{user?.rol}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
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
