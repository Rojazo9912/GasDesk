import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import quotationsService from '../../services/quotations.service';
import toast from 'react-hot-toast';

interface Supplier { id: string; nombre: string; contactoEmail?: string }
interface Product { id: string; nombre: string; unidad: string }
interface ScItem { id: string; productId: string; cantidadSolicitada: number; product: Product }

export default function NuevaCotizacion() {
  const { scId } = useParams<{ scId: string }>();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [scItems, setScItems] = useState<ScItem[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [validezDias, setValidezDias] = useState(15);
  const [notas, setNotas] = useState('');
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/suppliers').then(r => setSuppliers(r.data)).catch(() => {});
    if (scId) {
      api.get(`/purchase-requests/${scId}`).then(r => {
        setScItems(r.data.items ?? []);
      }).catch(() => toast.error('No se pudo cargar la solicitud'));
    }
  }, [scId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error('Selecciona un proveedor');
    if (!scId) return;

    setSaving(true);
    try {
      await quotationsService.create({
        solicitudId: scId,
        supplierId,
        validezDias,
        notas: notas || undefined,
        items: scItems.map(item => ({
          productId: item.productId,
          cantidadSolicitada: item.cantidadSolicitada,
          precioUnitario: prices[item.productId] ? parseFloat(prices[item.productId]) : undefined,
        })),
      });
      toast.success('Cotización creada');
      navigate(`/cotizaciones/comparar/${scId}`);
    } catch {
      toast.error('Error al crear la cotización');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nueva Cotización</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Proveedor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-700">Proveedor</h2>
          <select
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">Seleccionar proveedor...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Validez (días)</label>
              <input
                type="number"
                min={1}
                value={validezDias}
                onChange={e => setValidezDias(parseInt(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Notas</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Condiciones especiales, plazos, etc."
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Productos</h2>
          {scItems.length === 0 ? (
            <p className="text-slate-400 text-sm">Cargando productos...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="pb-2 text-left">Producto</th>
                  <th className="pb-2 text-right">Cantidad</th>
                  <th className="pb-2 text-right">Precio unitario</th>
                  <th className="pb-2 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {scItems.map(item => {
                  const precio = prices[item.productId] ? parseFloat(prices[item.productId]) : 0;
                  const importe = precio * item.cantidadSolicitada;
                  return (
                    <tr key={item.id}>
                      <td className="py-2 text-slate-700">
                        {item.product?.nombre}
                        <span className="ml-1 text-slate-400">{item.product?.unidad}</span>
                      </td>
                      <td className="py-2 text-right text-slate-600">{item.cantidadSolicitada}</td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={prices[item.productId] ?? ''}
                          onChange={e => setPrices(prev => ({ ...prev, [item.productId]: e.target.value }))}
                          className="w-24 border border-slate-300 rounded px-2 py-1 text-right text-sm"
                        />
                      </td>
                      <td className="py-2 text-right text-slate-700">
                        {importe > 0 ? `$${importe.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Crear Cotización'}
          </button>
        </div>
      </form>
    </div>
  );
}
