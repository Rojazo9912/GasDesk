import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseOrders } from '../../services/purchase-orders.service';

type EstatusBadge = { emoji: string; label: string; className: string };

const getEstatusBadge = (estatus: string): EstatusBadge => {
  switch (estatus) {
    case 'BORRADOR':          return { emoji: '📝', label: 'Borrador',        className: 'bg-slate-100 text-slate-600 border-slate-200' };
    case 'ENVIADA':           return { emoji: '📤', label: 'Enviada',         className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'RECIBIDA_PARCIAL':  return { emoji: '📦', label: 'Recib. Parcial',  className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'COMPLETADA':        return { emoji: '✅', label: 'Completada',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'CANCELADA':         return { emoji: '🚫', label: 'Cancelada',       className: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:                  return { emoji: '❓', label: estatus.replace(/_/g, ' '), className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
};

const ListaOrdenes = () => {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getPurchaseOrders();
      setOrdenes(data);
    } catch (error) {
      console.error('Error fetching OCs', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Órdenes de Compra</h1>
          <p className="text-sm text-slate-500 mt-0.5">Controla las compras autorizadas enviadas a los proveedores.</p>
        </div>
        <Link
          to="/solicitudes"
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:-translate-y-0.5"
        >
          ✍️ Convertir Desde Solicitud
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">OC / Fecha</th>
                <th className="px-5 py-3.5 font-semibold">🤝 Proveedor</th>
                <th className="px-5 py-3.5 font-semibold">Origen</th>
                <th className="px-5 py-3.5 font-semibold">📍 Sucursal</th>
                <th className="px-5 py-3.5 font-semibold">💰 Importe</th>
                <th className="px-5 py-3.5 font-semibold">Estatus</th>
                <th className="px-5 py-3.5 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <span className="text-3xl animate-bounce">⏳</span>
                      <span className="text-sm">Cargando órdenes...</span>
                    </div>
                  </td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <span className="text-3xl">📭</span>
                      <span className="text-sm">No hay Órdenes de Compra registradas.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                ordenes.map((oc) => {
                  const badge = getEstatusBadge(oc.estatus);
                  return (
                    <tr key={oc.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 font-mono text-xs">
                          OC-{oc.folio?.toString().padStart(4, '0') || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatearFecha(oc.fechaEmision)}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {oc.supplier?.nombre}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {oc.solicitud ? (
                          <Link
                            to={`/solicitudes/${oc.solicitud.id}`}
                            className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline underline-offset-2 transition-colors"
                          >
                            Ver Solicitud →
                          </Link>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {oc.location?.nombre}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                        ${oc.total?.toFixed(2)}
                        <span className="text-xs text-slate-400 font-sans font-normal ml-1">MXN</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.className}`}>
                          <span>{badge.emoji}</span>
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/ordenes/${oc.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-all duration-200"
                        >
                          📄 Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaOrdenes;
