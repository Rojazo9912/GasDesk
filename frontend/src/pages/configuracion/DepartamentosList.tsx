import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/departments.service';
import ConfirmModal from '../../components/shared/ConfirmModal';

const emptyForm = { nombre: '', descripcion: '' };

const DepartamentosList = () => {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await getDepartments();
      setDepartamentos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (d: any) => {
    setEditingId(d.id);
    setForm({ nombre: d.nombre, descripcion: d.descripcion || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { nombre: form.nombre, descripcion: form.descripcion || undefined };
      if (editingId) {
        await updateDepartment(editingId, payload);
      } else {
        await createDepartment(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Departamentos</h2>
          <p className="text-sm text-slate-500 mt-1">Organiza tu empresa por áreas o departamentos.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          + Nuevo Departamento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Descripción</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : departamentos.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Sin departamentos registrados.</td></tr>
            ) : (
              departamentos.map(d => (
                <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{d.nombre}</td>
                  <td className="px-6 py-4 text-slate-500">{d.descripcion || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(d)} className="text-emerald-600 hover:text-emerald-800 font-medium text-xs uppercase">Editar</button>
                    <button onClick={() => setPendingDelete(d.id)} className="text-rose-600 hover:text-rose-800 font-medium text-xs uppercase">Baja</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingId ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                  placeholder="Ej. Mantenimiento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear Departamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="¿Dar de baja el departamento?"
          message="Ya no estará disponible para asignar a solicitudes."
          confirmLabel="Dar de baja"
          danger
          onConfirm={async () => {
            const id = pendingDelete;
            setPendingDelete(null);
            try { await deleteDepartment(id); fetchData(); } catch (e) { console.error(e); }
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};

export default DepartamentosList;
