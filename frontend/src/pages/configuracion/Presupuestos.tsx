import { useEffect, useState } from 'react';
import budgetsService, { Budget, CreateBudgetPayload } from '../../services/budgets.service';
import { getLocations } from '../../services/locations.service';
import toast from 'react-hot-toast';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface Location { id: string; nombre: string }

function ProgressBar({ ejercido, asignado }: { ejercido: number; asignado: number }) {
  const pct = asignado > 0 ? Math.min((ejercido / asignado) * 100, 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-emerald-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>${ejercido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        <span>${asignado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-slate-400 mt-0.5 text-right">{pct.toFixed(0)}% ejercido</div>
    </div>
  );
}

export default function Presupuestos() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const now = new Date();
  const [filterAnio, setFilterAnio] = useState(now.getFullYear());
  const [filterMes, setFilterMes] = useState<number | undefined>(undefined);

  // Form state
  const [form, setForm] = useState<CreateBudgetPayload>({
    locationId: '',
    anio: now.getFullYear(),
    mes: now.getMonth() + 1,
    montoAsignado: 0,
  });

  const load = () => {
    setLoading(true);
    budgetsService.getAll({ anio: filterAnio, mes: filterMes })
      .then(setBudgets)
      .catch(() => toast.error('Error cargando presupuestos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterAnio, filterMes]);

  useEffect(() => {
    getLocations().then((data: any[]) => setLocations(data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ locationId: '', anio: now.getFullYear(), mes: now.getMonth() + 1, montoAsignado: 0 });
    setShowModal(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    setForm({ locationId: b.locationId, anio: b.anio, mes: b.mes, montoAsignado: b.montoAsignado });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.locationId || form.montoAsignado <= 0) {
      return toast.error('Completa todos los campos');
    }
    try {
      if (editing) {
        await budgetsService.update(editing.id, form.montoAsignado);
        toast.success('Presupuesto actualizado');
      } else {
        await budgetsService.create(form);
        toast.success('Presupuesto creado');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    try {
      await budgetsService.remove(id);
      toast.success('Presupuesto eliminado');
      load();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Presupuestos</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + Nuevo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Año</label>
          <select
            value={filterAnio}
            onChange={e => setFilterAnio(parseInt(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mes</label>
          <select
            value={filterMes ?? ''}
            onChange={e => setFilterMes(e.target.value ? parseInt(e.target.value) : undefined)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No hay presupuestos para el período seleccionado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-700">{b.location?.nombre ?? b.locationId}</div>
                  <div className="text-xs text-slate-400">{MESES[b.mes - 1]} {b.anio}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-1 text-slate-400 hover:text-indigo-600 text-xs"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1 text-slate-400 hover:text-red-600 text-xs"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <ProgressBar ejercido={b.montoEjercido} asignado={b.montoAsignado} />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Sucursal</label>
                <select
                  value={form.locationId}
                  onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
                  disabled={!!editing}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                >
                  <option value="">Seleccionar sucursal...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-slate-600 mb-1">Año</label>
                  <input
                    type="number"
                    min={2020}
                    value={form.anio}
                    onChange={e => setForm(f => ({ ...f, anio: parseInt(e.target.value) }))}
                    disabled={!!editing}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-600 mb-1">Mes</label>
                  <select
                    value={form.mes}
                    onChange={e => setForm(f => ({ ...f, mes: parseInt(e.target.value) }))}
                    disabled={!!editing}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                  >
                    {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Monto Asignado ($)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.montoAsignado}
                  onChange={e => setForm(f => ({ ...f, montoAsignado: parseFloat(e.target.value) }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
