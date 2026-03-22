import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, deleteSupplier } from '../../services/suppliers.service';

const ProveedoresList = () => {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    nombre: '', rfc: '', contactoNombre: '', contactoEmail: '', contactoTel: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getSuppliers();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createSupplier(form);
      alert('Proveedor creado');
      setModalOpen(false);
      setForm({ nombre: '', rfc: '', contactoNombre: '', contactoEmail: '', contactoTel: '' });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Desactivar este proveedor?')) return;
    try {
      await deleteSupplier(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Catálogo de Proveedores</h2>
          <p className="text-sm text-slate-500 mt-1">Empresas o personas físicas a quienes se les emitirán Órdenes de Compra.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          + Alta Proveedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Razón Social / Comercial</th>
              <th className="px-6 py-4 font-medium">RFC</th>
              <th className="px-6 py-4 font-medium">Contacto Principal</th>
              <th className="px-6 py-4 font-medium">Medios C.</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : proveedores.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay proveedores registrados.</td></tr>
            ) : (
              proveedores.map(p => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{p.nombre}</td>
                  <td className="px-6 py-4 font-mono text-xs">{p.rfc}</td>
                  <td className="px-6 py-4 text-slate-600">{p.contactoNombre || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500">{p.contactoEmail}</div>
                    <div className="text-xs text-slate-500">{p.contactoTel}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeactivate(p.id)} className="text-rose-600 hover:text-rose-800 font-medium text-xs uppercase">Baja</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Registrar Proveedor</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social *</label>
                  <input type="text" required value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" placeholder="Papelería y Suministros SA" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">RFC *</label>
                  <input type="text" required value={form.rfc} onChange={e=>setForm({...form, rfc: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none uppercase" placeholder="XAXX010101000" />
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Datos de Contacto Comercial</h4>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Vendedor</label>
                  <input type="text" value={form.contactoNombre} onChange={e=>setForm({...form, contactoNombre: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo (Para envíos PDF)</label>
                  <input type="email" value={form.contactoEmail} onChange={e=>setForm({...form, contactoEmail: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" placeholder="ventas@proveedor.com" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono Directo</label>
                  <input type="tel" value={form.contactoTel} onChange={e=>setForm({...form, contactoTel: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Crear Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedoresList;
