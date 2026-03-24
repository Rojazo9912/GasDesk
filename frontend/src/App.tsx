import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/shared/Layout';
import PermissionGuard from './components/shared/PermissionGuard';
import Login from './pages/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import ConfiguracionLayout from './pages/configuracion/ConfiguracionLayout';
import EmpresaSettings from './pages/configuracion/EmpresaSettings';
import SucursalesList from './pages/configuracion/SucursalesList';
import UsuariosList from './pages/configuracion/UsuariosList';
import FlujoAprobacion from './pages/configuracion/FlujoAprobacion';
import ProveedoresList from './pages/configuracion/ProveedoresList';
import DepartamentosList from './pages/configuracion/DepartamentosList';
import PerfilesList from './pages/configuracion/PerfilesList';
import Auditoria from './pages/configuracion/Auditoria';

import ListaSolicitudes from './pages/solicitudes/ListaSolicitudes';
import CrearSolicitud from './pages/solicitudes/CrearSolicitud';
import DetalleSolicitud from './pages/solicitudes/DetalleSolicitud';

import ListaOrdenes from './pages/ordenes/ListaOrdenes';
import NuevaOrden from './pages/ordenes/NuevaOrden';
import DetalleOrden from './pages/ordenes/DetalleOrden';

import ListaCotizaciones from './pages/cotizaciones/ListaCotizaciones';
import NuevaCotizacion from './pages/cotizaciones/NuevaCotizacion';
import ComparativaCotizaciones from './pages/cotizaciones/ComparativaCotizaciones';

import Presupuestos from './pages/configuracion/Presupuestos';

import InventarioLayout from './pages/inventario/InventarioLayout';
import StockActual from './pages/inventario/StockActual';
import Movimientos from './pages/inventario/Movimientos';
import CatalogoProductos from './pages/inventario/CatalogoProductos';
import StockDepartamentos from './pages/inventario/StockDepartamentos';
import Reportes from './pages/Reportes';
import EmpresasAdmin from './pages/admin/EmpresasAdmin';

// Permisos granulares para rutas
const P = {
  VIEW_SC: 'view_sc',
  VIEW_OC: 'view_oc',
  VIEW_REPORTS: 'view_reports',
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_USERS: 'manage_users',
  MANAGE_TENANTS: 'manage_tenants',
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          {/* Solicitudes — todos los roles con permiso view_sc */}
          <Route path="solicitudes" element={
            <PermissionGuard permission={P.VIEW_SC}><ListaSolicitudes /></PermissionGuard>
          } />
          <Route path="solicitudes/nueva" element={
            <PermissionGuard permission={P.VIEW_SC}><CrearSolicitud /></PermissionGuard>
          } />
          <Route path="solicitudes/:id" element={
            <PermissionGuard permission={P.VIEW_SC}><DetalleSolicitud /></PermissionGuard>
          } />

          {/* Órdenes — staff (no solicitante) */}
          <Route path="ordenes" element={
            <PermissionGuard permission={P.VIEW_OC}><ListaOrdenes /></PermissionGuard>
          } />
          <Route path="ordenes/nueva/:scId" element={
            <PermissionGuard permission={P.VIEW_OC}><NuevaOrden /></PermissionGuard>
          } />
          <Route path="ordenes/:id" element={
            <PermissionGuard permission={P.VIEW_OC}><DetalleOrden /></PermissionGuard>
          } />

          {/* Cotizaciones — staff */}
          <Route path="cotizaciones" element={
            <PermissionGuard permission={P.VIEW_OC}><ListaCotizaciones /></PermissionGuard>
          } />
          <Route path="cotizaciones/nueva/:scId" element={
            <PermissionGuard permission={P.VIEW_OC}><NuevaCotizacion /></PermissionGuard>
          } />
          <Route path="cotizaciones/comparar/:scId" element={
            <PermissionGuard permission={P.VIEW_OC}><ComparativaCotizaciones /></PermissionGuard>
          } />

          {/* Reportes — gerencia y arriba */}
          <Route path="reportes" element={
            <PermissionGuard permission={P.VIEW_REPORTS}><Reportes /></PermissionGuard>
          } />

          {/* Solo SUPER_ADMIN */}
          <Route path="admin/empresas" element={
            <PermissionGuard permission={P.MANAGE_TENANTS}><EmpresasAdmin /></PermissionGuard>
          } />

          {/* Inventario — staff (no solicitante) */}
          <Route path="inventario" element={
            <PermissionGuard permission={P.VIEW_INVENTORY}><InventarioLayout /></PermissionGuard>
          }>
            <Route index element={<Navigate to="stock" replace />} />
            <Route path="stock" element={<StockActual />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="productos" element={<CatalogoProductos />} />
            <Route path="departamentos" element={<StockDepartamentos />} />
          </Route>

          {/* Configuración — solo admins */}
          <Route path="/configuracion" element={
            <PermissionGuard permission={P.MANAGE_USERS}><ConfiguracionLayout /></PermissionGuard>
          }>
            <Route index element={<Navigate to="empresa" replace />} />
            <Route path="empresa" element={<EmpresaSettings />} />
            <Route path="sucursales" element={<SucursalesList />} />
            <Route path="usuarios" element={<UsuariosList />} />
            <Route path="flujos" element={<FlujoAprobacion />} />
            <Route path="proveedores" element={<ProveedoresList />} />
            <Route path="departamentos" element={<DepartamentosList />} />
            <Route path="perfiles" element={<PerfilesList />} />
            <Route path="presupuestos" element={<Presupuestos />} />
            <Route path="auditoria" element={<Auditoria />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
