import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getPerfiles, createPerfil, updatePerfil, deletePerfil } from '../../services/perfiles.service';
import ConfirmModal from '../../components/shared/ConfirmModal';

const ROL_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  COMPRAS: 'Compras / Pagos',
  CONTRALOR: 'Contraloría',
  ALMACENISTA: 'Almacenista',
  SOLICITANTE: 'Solicitante',
};

const ROL_COLORS: Record<string, string> = {
  ADMIN: 'bg-blue-100 text-blue-700',
  GERENTE: 'bg-teal-100 text-teal-700',
  COMPRAS: 'bg-amber-100 text-amber-700',
  CONTRALOR: 'bg-cyan-100 text-cyan-700',
  ALMACENISTA: 'bg-orange-100 text-orange-700',
  SOLICITANTE: 'bg-slate-100 text-slate-700',
};

const emptyForm = { nombre: '', descripcion: '', rol: 'SOLICITANTE' };

const PerfilesList = () => {
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre: string } | null>(null);

  const fetchData = async () => {
    try {
      const data = await getPerfiles();
      setPerfiles(data);
    } catch {
      toast.error('Error al cargar perfiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? '', rol: p.rol });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updatePerfil(editingId, form);
        toast.success('Perfil actualizado');
      } else {
        await createPerfil(form);
        toast.success(`Perfil "${form.nombre}" creado`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Perfiles y Puestos</h2>
          <p className="text-sm text-slate-500">Define los puestos de tu empresa y el nivel de acceso que otorgan.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          + Nuevo Perfil
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-3 font-medium">Puesto / Perfil</th>
              <th className="px-6 py-3 font-medium">Nivel de acceso</th>
              <th className="px-6 py-3 font-medium">Descripción</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : perfiles.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sin perfiles registrados. Crea el primero.</td></tr>
            ) : (
              perfiles.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{p.nombre}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROL_COLORS[p.rol] || 'bg-slate-100 text-slate-700'}`}>
                      {ROL_LABELS[p.rol] ?? p.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{p.descripcion || '—'}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(p)} className="text-slate-500 hover:text-slate-800 text-xs font-medium">
                      Editar
                    </button>
                    <button onClick={() => setPendingDelete({ id: p.id, nombre: p.nombre })} className="text-rose-500 hover:text-rose-700 text-xs font-medium">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Editar Perfil' : 'Nuevo Perfil'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del puesto *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Ej. Gerente Administrativo, Jefe de Departamento…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Describe brevemente el puesto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de acceso *</label>
                <select
                  value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="ADMIN">Administrador — acceso total a la empresa</option>
                  <option value="GERENTE">Gerente — aprueba solicitudes y gestiona sucursal</option>
                  <option value="COMPRAS">Compras — crea y gestiona órdenes de compra</option>
                  <option value="CONTRALOR">Contraloría — valida facturas y CFDI</option>
                  <option value="ALMACENISTA">Almacenista — gestiona inventario y recepciones</option>
                  <option value="SOLICITANTE">Solicitante — solo puede crear solicitudes</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">El nivel de acceso determina qué puede hacer el usuario en el sistema.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium text-sm disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="¿Eliminar perfil?"
          message={`El perfil "${pendingDelete.nombre}" será desactivado. Los usuarios asignados no se verán afectados.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={async () => {
            const { id } = pendingDelete;
            setPendingDelete(null);
            try {
              await deletePerfil(id);
              toast.success('Perfil eliminado');
              fetchData();
            } catch {
              toast.error('Error al eliminar el perfil');
            }
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};

export default PerfilesList;
