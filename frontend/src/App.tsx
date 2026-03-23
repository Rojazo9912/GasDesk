import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConfiguracionLayout from './pages/configuracion/ConfiguracionLayout';
import EmpresaSettings from './pages/configuracion/EmpresaSettings';
import SucursalesList from './pages/configuracion/SucursalesList';
import UsuariosList from './pages/configuracion/UsuariosList';
import FlujoAprobacion from './pages/configuracion/FlujoAprobacion';
import ProveedoresList from './pages/configuracion/ProveedoresList';

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
import Reportes from './pages/Reportes';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas por Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          
          <Route path="solicitudes" element={<ListaSolicitudes />} />
          <Route path="solicitudes/nueva" element={<CrearSolicitud />} />
          <Route path="solicitudes/:id" element={<DetalleSolicitud />} />

          <Route path="ordenes" element={<ListaOrdenes />} />
          <Route path="ordenes/nueva/:scId" element={<NuevaOrden />} />
          <Route path="ordenes/:id" element={<DetalleOrden />} />

          <Route path="reportes" element={<Reportes />} />

          <Route path="inventario" element={<InventarioLayout />}>
            <Route index element={<Navigate to="stock" replace />} />
            <Route path="stock" element={<StockActual />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="productos" element={<CatalogoProductos />} />
          </Route>
          
          <Route path="/configuracion" element={<ConfiguracionLayout />}>
            <Route index element={<Navigate to="empresa" replace />} />
            <Route path="empresa" element={<EmpresaSettings />} />
            <Route path="sucursales" element={<SucursalesList />} />
            <Route path="usuarios" element={<UsuariosList />} />
            <Route path="flujos" element={<FlujoAprobacion />} />
            <Route path="proveedores" element={<ProveedoresList />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
