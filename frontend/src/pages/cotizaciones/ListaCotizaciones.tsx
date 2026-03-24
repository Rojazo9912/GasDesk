import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import quotationsService, { Quotation } from '../../services/quotations.service';
import toast from 'react-hot-toast';

const ESTATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  RESPONDIDA: 'Respondida',
  SELECCIONADA: 'Seleccionada',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada',
};

const ESTATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  RESPONDIDA: 'bg-blue-100 text-blue-700',
  SELECCIONADA: 'bg-emerald-100 text-emerald-700',
  VENCIDA: 'bg-slate-100 text-slate-500',
  CANCELADA: 'bg-red-100 text-red-600',
};

export default function ListaCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quotationsService.getAll()
      .then(setCotizaciones)
      .catch(() => toast.error('Error cargando cotizaciones'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Cotizaciones</h1>

      {cotizaciones.length === 0 ? (
        <div className="text-center text-slate-400 py-16">No hay cotizaciones registradas.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Solicitud</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Validez</th>
                <th className="px-4 py-3 text-left">Estatus</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cotizaciones.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/solicitudes/${c.solicitudId}`} className="text-indigo-600 hover:underline font-medium">
                      Ver SC
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.supplier?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{c.items.length} producto(s)</td>
                  <td className="px-4 py-3 text-slate-500">{c.validezDias} días</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTATUS_COLORS[c.estatus]}`}>
                      {ESTATUS_LABELS[c.estatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(c.creadoEn).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/cotizaciones/comparar/${c.solicitudId}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Comparar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
