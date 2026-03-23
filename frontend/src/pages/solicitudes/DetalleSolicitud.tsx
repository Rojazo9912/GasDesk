import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPurchaseRequestById, approveRequest, rejectRequest, markRequestAsCompleted } from '../../services/purchase-requests.service';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/shared/ConfirmModal';

const DetalleSolicitud = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [solicitud, setSolicitud] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [comentario, setComentario] = useState('');
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void } | null>(null);

  const fetchData = async () => {
    try {
      if (id) {
        const data = await getPurchaseRequestById(id);
        setSolicitud(data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error cargando solicitud');
      navigate('/solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApprove = () => {
    setConfirmModal({
      title: '¿Aprobar solicitud?',
      message: 'Se enviará al siguiente nivel de aprobación.',
      confirmLabel: 'Aprobar',
      onConfirm: async () => {
        setConfirmModal(null);
        setProcessing(true);
        try {
          await approveRequest(id!, comentario);
          toast.success('Solicitud aprobada con éxito');
          fetchData();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al aprobar');
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!comentario) {
      toast.error('Debes escribir un motivo de rechazo');
      return;
    }
    setProcessing(true);
    try {
      await rejectRequest(id!, comentario);
      toast.success('Solicitud rechazada');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rechazar');
    } finally {
      setProcessing(false);
      setMostrarRechazo(false);
    }
  };

  const handleComplete = () => {
    setConfirmModal({
      title: '¿Marcar como Completada?',
      message: 'El material ya fue comprado o procesado. Esta acción es definitiva.',
      confirmLabel: 'Marcar Completada',
      onConfirm: async () => {
        setConfirmModal(null);
        setProcessing(true);
        try {
          await markRequestAsCompleted(id!);
          toast.success('Solicitud marcada como completada');
          fetchData();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al completar');
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando detalles...</div>;
  if (!solicitud) return null;

  // Determinar si el usuario actual es el aprobador en turno
  // Buscamos si hay algún registro en el historial que indique que la solicitud está esperando a este usuario
  // De manera simple: si el estatus es PENDIENTE_NIVEL_X y el usuario tiene el rol y turno, o si el backend retorna algo
  // (Para esta versión, validaremos mostrando los botones si su rol coincide con el ultimo requerimiento en historial)
  // O simplemente dejaremos que la UI muestre los botones a Admins o a los involucrados, y el backend valide duramente.
  const isPending = solicitud.estatus.startsWith('PENDIENTE');
  const isCompras = user?.rol === 'COMPRAS';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            {user?.tenant?.logo && (
              <img src={user.tenant.logo} alt="logo" className="h-10 object-contain max-w-[80px]" />
            )}
            <h1 className="text-2xl font-bold text-slate-800">SC-{solicitud.id?.slice(0, 8).toUpperCase()}</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full border border-slate-200">
              {solicitud.estatus}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Solicitado por {solicitud.solicitante.nombre} el {new Date(solicitud.creadoEn).toLocaleDateString()}</p>
        </div>
        <div>
           <button onClick={() => navigate('/solicitudes')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">← Volver</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Detalles y Productos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Información General</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="block text-slate-500 mb-1">Sucursal de Destino</span>
                <span className="font-medium text-slate-800">{solicitud.location?.nombre}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Nivel Actual</span>
                <span className="font-medium text-slate-800">Nivel {solicitud.nivelActual}</span>
              </div>
            </div>
            {solicitud.notas && (
              <div className="bg-amber-50 rounded-md p-3 text-sm text-amber-800 border border-amber-100">
                <span className="font-semibold block mb-1">Motivo / Notas:</span>
                {solicitud.notas}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Artículos Solicitados ({solicitud.items.length})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-left">
                <tr>
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 font-medium">Cantidad</th>
                  <th className="p-3 font-medium">Justificación</th>
                </tr>
              </thead>
              <tbody>
                {solicitud.items.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0">
                    <td className="p-3 font-medium text-slate-700">{item.product.nombre} <span className="text-slate-400 font-normal ml-1">({item.product.unidad})</span></td>
                    <td className="p-3">{item.cantidadSolicitada}</td>
                    <td className="p-3 text-slate-600 italic">{item.justificacion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Derecho: Timeline y Acciones */}
        <div className="space-y-6">
          {/* Botonera de Aprobación */}
          {isPending && (
            <div className="bg-white rounded-lg border border-emerald-200 shadow-sm overflow-hidden">
               <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                 <h3 className="font-semibold text-emerald-800">Zona de Autorización</h3>
               </div>
               
               <div className="p-4 space-y-4">
                 {/* ... */}
                 {mostrarRechazo ? (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                     <label className="text-sm font-medium text-slate-700">Explica el motivo del rechazo:</label>
                     <textarea 
                       value={comentario}
                       onChange={(e) => setComentario(e.target.value)}
                       className="w-full border border-rose-200 rounded-md p-2 text-sm focus:ring-rose-500 outline-none"
                       rows={3}
                     />
                     <div className="flex gap-2">
                        <button onClick={handleReject} disabled={processing} className="flex-1 bg-rose-600 text-white py-2 rounded font-medium text-sm hover:bg-rose-700 disabled:opacity-50">Confirmar Rechazo</button>
                        <button onClick={() => setMostrarRechazo(false)} className="px-4 bg-slate-100 text-slate-600 rounded font-medium text-sm hover:bg-slate-200">Cancelar</button>
                     </div>
                   </div>
                 ) : (
                   <>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-700 block">Comentario opcional para aprobar:</label>
                       <input 
                         type="text" 
                         value={comentario}
                         onChange={(e) => setComentario(e.target.value)}
                         className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-emerald-500"
                         placeholder="Ej. Todo en orden"
                       />
                     </div>
                     
                     {solicitud.estatus === 'PENDIENTE_COMPRAS' && isCompras ? (
                       <button 
                         onClick={handleComplete}
                         disabled={processing}
                         className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition-colors disabled:opacity-50"
                       >
                         MARCAR COMO COMPLETA / PROCESADA
                       </button>
                     ) : (
                       <div className="flex gap-2">
                         <button 
                           onClick={handleApprove}
                           disabled={processing}
                           className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold transition-colors shadow-sm disabled:opacity-50 text-sm"
                         >
                           APROBAR
                         </button>
                         <button 
                           onClick={() => setMostrarRechazo(true)}
                           disabled={processing}
                           className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md font-bold transition-colors border border-rose-200 disabled:opacity-50 text-sm"
                         >
                           RECHAZAR
                         </button>
                       </div>
                     )}
                   </>
                 )}
                 
                 <p className="text-xs text-slate-400 text-center">Solo el aprobador en turno o los Super Admins tienen el poder de avanzar esta solicitud.</p>
               </div>
             </div>
          )}

          {(solicitud.estatus === 'PENDIENTE_COMPRAS' || solicitud.estatus === 'COMPLETADA') && isCompras && (
            <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm text-center">
               <h3 className="text-sm font-bold text-slate-800 mb-2">Acciones de Compras</h3>
               <button 
                  onClick={() => navigate(`/ordenes/nueva/${solicitud.id}`)}
                  className="w-full bg-slate-800 text-white font-bold py-2 rounded-md hover:bg-slate-900 transition-colors shadow-sm text-sm"
               >
                  Convertir a Órden de Compra →
               </button>
            </div>
          )}

          {/* Historial Timeline */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Historial de Flujo</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {solicitud.historial.map((hist: any) => {
                const isCreation = hist.accion === 'creado';
                const isApproval = hist.accion === 'aprobado';
                const isRejection = hist.accion === 'rechazado';
                const isEscalation = hist.accion === 'recibido_escalacion';

                let dotColor = 'bg-slate-300';
                let actionText = 'Cambio de Estado';
                if (isCreation) { dotColor = 'bg-blue-400'; actionText = 'Solicitud Creada'; }
                if (isApproval) { dotColor = 'bg-emerald-500'; actionText = 'Aprobada por'; }
                if (isRejection) { dotColor = 'bg-rose-500'; actionText = 'Rechazada por'; }
                if (isEscalation) { dotColor = 'bg-amber-400'; actionText = 'Pendiente con'; }

                return (
                  <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${dotColor} text-white shadow shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2`}>
                      <span className="text-xs font-bold">{hist.flow?.nivelOrden || 'Ini'}</span>
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded bg-slate-50 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-800 text-sm">{actionText}</div>
                        <time className="font-medium text-xs text-slate-400">{new Date(hist.fecha).toLocaleString()}</time>
                      </div>
                      <div className="text-sm text-slate-600 font-medium">{hist.aprobador?.nombre} <span className="font-normal text-xs text-slate-400 ml-1">({hist.aprobador?.rol})</span></div>
                      <div className="text-slate-500 text-xs mt-2 italic">"{hist.comentario}"</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default DetalleSolicitud;
