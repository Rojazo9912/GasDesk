import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTenant, updateTenant } from '../../services/tenants.service';

const EmpresaSettings = () => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [rfc, setRfc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.tenant?.id) {
      loadTenant(user.tenant.id);
    }
  }, [user]);

  const loadTenant = async (tenantId: string) => {
    try {
      const data = await getTenant(tenantId);
      setTenant(data);
      setNombre(data.nombre);
      setRfc(data.rfc);
    } catch (error) {
      console.error('Error fetching tenant', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenant?.id) return;
    
    setSaving(true);
    setMessage('');
    try {
      await updateTenant(user.tenant.id, { nombre });
      setMessage('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error updating tenant', error);
      setMessage('Error al actualizar los datos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-6 text-slate-800">Datos de la Empresa</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">RFC</label>
          <input 
            type="text" 
            value={rfc}
            disabled
            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed focus:outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">El RFC no se puede modificar una vez registrado.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercial / Razón Social</label>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo (URL)</label>
          <input 
            type="text" 
            value={tenant?.logo || ''}
            disabled
            placeholder="Subida de logo temporalmente deshabilitada"
            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmpresaSettings;
