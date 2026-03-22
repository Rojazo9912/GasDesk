import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseOrders } from '../../services/purchase-orders.service';

const estatusColor = (estatus: string) => {
  switch (estatus) {
    case 'BORRADOR': return 'bg-slate-100 text-slate-700';
    case 'ENVIADA': return 'bg-blue-100 text-blue-700';
    case 'RECIBIDA_PARCIAL': return 'bg-amber-100 text-amber-700';
    case 'COMPLETADA': return 'bg-emerald-100 text-emerald-700';
    case 'CANCELADA': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Órdenes de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Controla las compras autorizadas enviadas a los proveedores.</p>
        </div>
        {/* Usualmente las OC se crean desde una SC autorizada, no manual, 
            pero podemos dejar el flujo de "Nueva" por si acaso o bloquearlo */}
        <Link 
          to="/solicitudes" 
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
           Convertir Desde Solicitud →
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">OC / Fecha</th>
                <th className="px-6 py-4 font-medium">Proveedor</th>
                <th className="px-6 py-4 font-medium">Origen</th>
                <th className="px-6 py-4 font-medium">Sucursal</th>
                <th className="px-6 py-4 font-medium">Importe Total</th>
                <th className="px-6 py-4 font-medium">Estatus</th>
                <th className="px-6 py-4 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Cargando órdenes...</td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No hay Órdenes de Compra registradas.</td>
                </tr>
              ) : (
                ordenes.map((oc) => (
                  <tr key={oc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">OC-{oc.folio?.toString().padStart(4, '0') || 'N/A'}</div>
                      <div className="text-xs text-slate-500 mt-1">{formatearFecha(oc.fechaEmision)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {oc.supplier?.nombre}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {oc.solicitud ? (
                        <Link to={`/solicitudes/${oc.solicitud.id}`} className="text-emerald-600 hover:underline">
                          Ver Solicitud Base
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {oc.location?.nombre}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                      ${oc.total?.toFixed(2)} MXN
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full uppercase ${estatusColor(oc.estatus)}`}>
                        {oc.estatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link to={`/ordenes/${oc.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1.5 rounded bg-blue-50">
                         Abrir PDF →
                       </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaOrdenes;
