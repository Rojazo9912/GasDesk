import { useState, useEffect } from 'react';
import { getApprovalFlows, createApprovalFlow, reorderApprovalFlows, deleteApprovalFlow } from '../../services/approval-flows.service';
import { getUsers } from '../../services/users.service';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-4 mb-3">
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-2 rounded text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nivel {props.index + 1}</span>
            <h4 className="text-lg font-semibold text-slate-800">{props.flow.nombre}</h4>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
            Hasta {props.flow.tiempoLimiteHrs ? `${props.flow.tiempoLimiteHrs} hrs` : 'Sin límite'}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            {props.flow.aprobador?.nombre?.charAt(0) || '?'}
          </div>
          <span>{props.flow.aprobador?.nombre}</span>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{props.flow.aprobador?.rol}</span>
        </div>
      </div>
      <div>
        <button onClick={() => props.onDelete(props.id)} className="text-rose-400 hover:text-rose-600 p-2">
          Desactivar
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
const FlujoAprobacion = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingReorder, setSavingReorder] = useState(false);

  // Form
  const [nombre, setNombre] = useState('');
  const [aprobadorId, setAprobadorId] = useState('');
  const [tiempoLimiteHrs, setTiempoLimiteHrs] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    try {
      const [fData, uData] = await Promise.all([getApprovalFlows(), getUsers()]);
      setFlows(fData);
      setUsers(uData.filter((u: any) => u.activo));
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFlows((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setSavingReorder(true);
    try {
      const flowIds = flows.map(f => f.id);
      await reorderApprovalFlows(flowIds);
      alert('Orden guardado exitosamente.');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el orden. Recuerda que el último nivel debe ser de COMPRAS.');
      fetchData(); // Reset order
    } finally {
      setSavingReorder(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApprovalFlow({ 
        nombre, 
        aprobadorId, 
        tiempoLimiteHrs: tiempoLimiteHrs ? parseInt(tiempoLimiteHrs) : null 
      });
      setIsModalOpen(false);
      setNombre('');
      setAprobadorId('');
      setTiempoLimiteHrs('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear nivel');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Desactivar este nivel de aprobación?')) {
      try {
        await deleteApprovalFlow(id);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Motor de Aprobaciones</h2>
          <p className="text-sm text-slate-500">Configura la jerarquía autorizativa para las solicitudes de compra.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveOrder}
            disabled={savingReorder}
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 px-4 py-2 rounded-md font-medium text-sm transition-colors border border-sky-200"
          >
            {savingReorder ? 'Guardando...' : 'Guardar Orden Visual'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            Agregar Nivel
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 min-h-[400px]">
        {flows.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">No hay niveles configurados. Agrega uno nuevo.</div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={flows.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {flows.map((flow, index) => (
                <SortableItem key={flow.id} id={flow.id} flow={flow} index={index} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Nuevo Nivel de Aprobación</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Nivel</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. VoBo Jefe Directo"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuario Aprobador</label>
                <select
                  value={aprobadorId}
                  onChange={(e) => setAprobadorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Seleccionar Usuario --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Recuerda que el último nivel del flujo siempre debe pertenecer a alguien de COMPRAS.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo límite (Horas)</label>
                <input 
                  type="number" 
                  min="1"
                  value={tiempoLimiteHrs}
                  onChange={(e) => setTiempoLimiteHrs(e.target.value)}
                  placeholder="Ej. 24"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">Dejar vacío para "sin límite" (la operación no se escalará automáticamente).</p>
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
                  Guardar Nivel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlujoAprobacion;
