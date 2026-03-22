import { useState, useEffect } from 'react';
import { getLocations, createLocation, deleteLocation, updateLocation } from '../../services/locations.service';

const SucursalesList = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('estacion');
  const [direccion, setDireccion] = useState('');

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenModal = (location?: any) => {
    if (location) {
      setEditingId(location.id);
      setNombre(location.nombre);
      setTipo(location.tipo);
      setDireccion(location.direccion || '');
    } else {
      setEditingId(null);
      setNombre('');
      setTipo('estacion');
      setDireccion('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLocation(editingId, { nombre, tipo, direccion });
      } else {
        await createLocation({ nombre, tipo, direccion });
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (error) {
      console.error('Error saving location', error);
      alert('Error al guardar la sucursal');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de desactivar esta sucursal?')) {
      try {
        await deleteLocation(id);
        fetchLocations();
      } catch (error) {
        console.error('Error deleting location', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Sucursales y Estaciones</h2>
          <p className="text-sm text-slate-500">Administra las ubicaciones físicas de tu empresa.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Nueva Sucursal
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Dirección</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">No hay sucursales registradas</td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{loc.nombre}</td>
                  <td className="p-4 text-slate-600 capitalize">{loc.tipo}</td>
                  <td className="p-4 text-slate-600">{loc.direccion || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenModal(loc)}
                      className="text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(loc.id)}
                      className="text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="estacion">Estación de Servicio</option>
                  <option value="almacen">Almacén Central</option>
                  <option value="bodega">Bodega Externa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección (Opcional)</label>
                <input 
                  type="text" 
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SucursalesList;
