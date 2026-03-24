import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import quotationsService, { Quotation } from '../../services/quotations.service';
import toast from 'react-hot-toast';

export default function ComparativaCotizaciones() {
  const { scId } = useParams<{ scId: string }>();
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  const load = () => {
    if (!scId) return;
    setLoading(true);
    quotationsService.getBySolicitud(scId)
      .then(setCotizaciones)
      .catch(() => toast.error('Error cargando cotizaciones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [scId]);

  const handleSelect = async (id: string) => {
    if (!confirm('¿Seleccionar esta cotización como ganadora?')) return;
    setSelecting(id);
    try {
      await quotationsService.select(id);
      toast.success('Cotización seleccionada. La SC pasa a EN PROCESO.');
      load();
    } catch {
      toast.error('Error al seleccionar la cotización');
    } finally {
      setSelecting(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta cotización?')) return;
    try {
      await quotationsService.cancel(id);
      toast.success('Cotización cancelada');
      load();
    } catch {
      toast.error('Error al cancelar');
    }
  };

  // Obtener lista de todos los productos únicos
  const allProducts = Array.from(
    new Map(
      cotizaciones.flatMap(c => c.items).map(i => [i.productId, i.product])
    ).entries()
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Comparativa de Cotizaciones</h1>
        <Link
          to={`/cotizaciones/nueva/${scId}`}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + Nueva Cotización
        </Link>
      </div>

      {cotizaciones.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          No hay cotizaciones para esta solicitud.
          <div className="mt-4">
            <Link to={`/cotizaciones/nueva/${scId}`} className="text-indigo-600 hover:underline">
              Crear la primera cotización
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-3 text-left text-slate-600">Producto</th>
                {cotizaciones.map(c => (
                  <th key={c.id} className="px-4 py-3 text-center min-w-[180px]">
                    <div className="font-semibold text-slate-700">{c.supplier?.nombre}</div>
                    <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${
                      c.estatus === 'SELECCIONADA' ? 'bg-emerald-100 text-emerald-700' :
                      c.estatus === 'CANCELADA' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {c.estatus}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Validez: {c.validezDias}d</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allProducts.map(([productId, product]) => (
                <tr key={productId} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-medium">
                    {product?.nombre ?? productId}
                    <span className="text-xs text-slate-400 ml-1">{product?.unidad}</span>
                  </td>
                  {cotizaciones.map(c => {
                    const item = c.items.find(i => i.productId === productId);
                    const precio = item?.precioUnitario;
                    const importe = item ? (precio ?? 0) * item.cantidadSolicitada : null;

                    // Precio más bajo entre todos los proveedores para este producto
                    const precios = cotizaciones
                      .map(q => q.items.find(i => i.productId === productId)?.precioUnitario)
                      .filter((p): p is number => p !== undefined && p > 0);
                    const minPrecio = precios.length > 0 ? Math.min(...precios) : null;
                    const esMenor = precio !== undefined && precio > 0 && precio === minPrecio;

                    return (
                      <td key={c.id} className={`px-4 py-2 text-center ${esMenor ? 'bg-emerald-50' : ''}`}>
                        {precio !== undefined && precio > 0 ? (
                          <>
                            <div className={`font-medium ${esMenor ? 'text-emerald-700' : 'text-slate-700'}`}>
                              ${precio.toFixed(2)}
                            </div>
                            {importe !== null && (
                              <div className="text-xs text-slate-400">${importe.toFixed(2)} total</div>
                            )}
                            {esMenor && <div className="text-xs text-emerald-600 font-medium">★ Mejor precio</div>}
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Fila total */}
              <tr className="bg-slate-50 font-semibold">
                <td className="px-4 py-3 text-slate-700">Total estimado</td>
                {cotizaciones.map(c => {
                  const total = c.items.reduce((sum, i) => sum + (i.precioUnitario ?? 0) * i.cantidadSolicitada, 0);
                  return (
                    <td key={c.id} className="px-4 py-3 text-center text-slate-700">
                      {total > 0 ? `$${total.toFixed(2)}` : '—'}
                    </td>
                  );
                })}
              </tr>

              {/* Fila acciones */}
              <tr>
                <td className="px-4 py-3" />
                {cotizaciones.map(c => (
                  <td key={c.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col gap-2 items-center">
                      {c.estatus !== 'SELECCIONADA' && c.estatus !== 'CANCELADA' && (
                        <button
                          onClick={() => handleSelect(c.id)}
                          disabled={selecting === c.id}
                          className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {selecting === c.id ? 'Seleccionando...' : 'Seleccionar'}
                        </button>
                      )}
                      {c.estatus === 'SELECCIONADA' && (
                        <span className="text-xs text-emerald-700 font-semibold">✓ Ganadora</span>
                      )}
                      {c.estatus !== 'SELECCIONADA' && c.estatus !== 'CANCELADA' && (
                        <button
                          onClick={() => handleCancel(c.id)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:underline">
          ← Volver
        </button>
      </div>
    </div>
  );
}
