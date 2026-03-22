import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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
          <Route path="/configuracion" element={<div className="p-4">Configuración del Tenant</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
