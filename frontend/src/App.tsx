import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConfiguracionLayout from './pages/configuracion/ConfiguracionLayout';
import EmpresaSettings from './pages/configuracion/EmpresaSettings';
import SucursalesList from './pages/configuracion/SucursalesList';
import UsuariosList from './pages/configuracion/UsuariosList';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas por Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sc" element={<div className="p-4">Lista de Solicitudes de Compra</div>} />
          <Route path="/oc" element={<div className="p-4">Órdenes de Compra</div>} />
          <Route path="/inventario" element={<div className="p-4">Inventario Actual</div>} />
          
          <Route path="/configuracion" element={<ConfiguracionLayout />}>
            <Route index element={<Navigate to="empresa" replace />} />
            <Route path="empresa" element={<EmpresaSettings />} />
            <Route path="sucursales" element={<SucursalesList />} />
            <Route path="usuarios" element={<UsuariosList />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
