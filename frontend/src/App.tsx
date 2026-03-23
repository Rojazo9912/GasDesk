import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/shared/Layout';
import RoleGuard from './components/shared/RoleGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConfiguracionLayout from './pages/configuracion/ConfiguracionLayout';
import EmpresaSettings from './pages/configuracion/EmpresaSettings';
import SucursalesList from './pages/configuracion/SucursalesList';
import UsuariosList from './pages/configuracion/UsuariosList';
import FlujoAprobacion from './pages/configuracion/FlujoAprobacion';
import ProveedoresList from './pages/configuracion/ProveedoresList';
import DepartamentosList from './pages/configuracion/DepartamentosList';
import PerfilesList from './pages/configuracion/PerfilesList';

import ListaSolicitudes from './pages/solicitudes/ListaSolicitudes';
import CrearSolicitud from './pages/solicitudes/CrearSolicitud';
import DetalleSolicitud from './pages/solicitudes/DetalleSolicitud';

import ListaOrdenes from './pages/ordenes/ListaOrdenes';
import NuevaOrden from './pages/ordenes/NuevaOrden';
import DetalleOrden from './pages/ordenes/DetalleOrden';

import InventarioLayout from './pages/inventario/InventarioLayout';
import StockActual from './pages/inventario/StockActual';
import Movimientos from './pages/inventario/Movimientos';
import CatalogoProductos from './pages/inventario/CatalogoProductos';
import StockDepartamentos from './pages/inventario/StockDepartamentos';
import Reportes from './pages/Reportes';
import EmpresasAdmin from './pages/admin/EmpresasAdmin';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'COMPRAS', 'CONTRALOR', 'ALMACENISTA'];
const REPORT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'COMPRAS', 'CONTRALOR'];

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          {/* Solicitudes — todos los roles */}
          <Route path="solicitudes" element={<ListaSolicitudes />} />
          <Route path="solicitudes/nueva" element={<CrearSolicitud />} />
          <Route path="solicitudes/:id" element={<DetalleSolicitud />} />

          {/* Órdenes — staff (no solicitante) */}
          <Route path="ordenes" element={
            <RoleGuard roles={STAFF_ROLES}><ListaOrdenes /></RoleGuard>
          } />
          <Route path="ordenes/nueva/:scId" element={
            <RoleGuard roles={STAFF_ROLES}><NuevaOrden /></RoleGuard>
          } />
          <Route path="ordenes/:id" element={
            <RoleGuard roles={STAFF_ROLES}><DetalleOrden /></RoleGuard>
          } />

          {/* Reportes — gerencia y arriba */}
          <Route path="reportes" element={
            <RoleGuard roles={REPORT_ROLES}><Reportes /></RoleGuard>
          } />

          {/* Solo SUPER_ADMIN */}
          <Route path="admin/empresas" element={
            <RoleGuard roles={['SUPER_ADMIN']}><EmpresasAdmin /></RoleGuard>
          } />

          {/* Inventario — staff (no solicitante) */}
          <Route path="inventario" element={
            <RoleGuard roles={STAFF_ROLES}><InventarioLayout /></RoleGuard>
          }>
            <Route index element={<Navigate to="stock" replace />} />
            <Route path="stock" element={<StockActual />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="productos" element={<CatalogoProductos />} />
            <Route path="departamentos" element={<StockDepartamentos />} />
          </Route>

          {/* Configuración — solo admins */}
          <Route path="/configuracion" element={
            <RoleGuard roles={ADMIN_ROLES}><ConfiguracionLayout /></RoleGuard>
          }>
            <Route index element={<Navigate to="empresa" replace />} />
            <Route path="empresa" element={<EmpresaSettings />} />
            <Route path="sucursales" element={<SucursalesList />} />
            <Route path="usuarios" element={<UsuariosList />} />
            <Route path="flujos" element={<FlujoAprobacion />} />
            <Route path="proveedores" element={<ProveedoresList />} />
            <Route path="departamentos" element={<DepartamentosList />} />
            <Route path="perfiles" element={<PerfilesList />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
