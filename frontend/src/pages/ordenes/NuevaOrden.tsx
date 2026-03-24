import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPurchaseRequestById } from '../../services/purchase-requests.service';
import { getSuppliers, getSupplierPrices } from '../../services/suppliers.service';
import { createPurchaseOrder } from '../../services/purchase-orders.service';
import { AlertTriangle, Info } from 'lucide-react';

const NuevaOrden = () => {
  const { scId } = useParams<{ scId: string }>();
  const navigate = useNavigate();
  
  const [solicitud, setSolicitud] = useState<any>(null);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Frm
  const [supplierId, setSupplierId] = useState('');
  const [fechaEntregaEsperada, setFechaEntregaEsperada] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [catalogPrices, setCatalogPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scData, supData] = await Promise.all([
          getPurchaseRequestById(scId!),
          getSuppliers()
        ]);
        setSolicitud(scData);
        setProveedores(supData);
        
        // Mapear items base
        const mappedItems = scData.items.map((i: any) => ({
          productId: i.productId,
          productName: i.product.nombre,
          productUnit: i.product.unidad,
          cantidadOrdenada: i.cantidadSolicitada,
          precioUnitario: 0,
          importe: 0
        }));
        setItems(mappedItems);
        
      } catch (error) {
        console.error(error);
        toast.error('Error cargando los datos base para la orden');
        navigate('/ordenes');
      } finally {
        setLoading(false);
      }
    };
    if (scId) fetchData();
  }, [scId, navigate]);

  // Priority 11: Auto-completar precios cuando cambia el proveedor
  useEffect(() => {
    if (!supplierId) {
      setCatalogPrices({});
      return;
    }

    const fetchPrices = async () => {
      try {
        const prices = await getSupplierPrices(supplierId);
        const priceMap: Record<string, number> = {};
        prices.forEach((p: any) => {
          if (!priceMap[p.productId]) {
            priceMap[p.productId] = p.precio;
          }
        });
        setCatalogPrices(priceMap);

        setItems(prev => prev.map(item => {
          if (item.precioUnitario === 0 && priceMap[item.productId]) {
            const newPrice = priceMap[item.productId];
            return {
              ...item,
              precioUnitario: newPrice,
              importe: item.cantidadOrdenada * newPrice
            };
          }
          return item;
        }));
      } catch (e) {
        console.error('Error fetching catalog prices', e);
      }
    };

    fetchPrices();
  }, [supplierId]);

  const handlePriceChange = (index: number, newPrice: number) => {
    const newArr = [...items];
    newArr[index].precioUnitario = newPrice;
    newArr[index].importe = newArr[index].cantidadOrdenada * newPrice;
    setItems(newArr);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const newArr = [...items];
    newArr[index].cantidadOrdenada = newQty;
    newArr[index].importe = newQty * newArr[index].precioUnitario;
    setItems(newArr);
  };

  const getPriceDiff = (productId: string, currentPrice: number) => {
    const catPrice = catalogPrices[productId];
    if (!catPrice || catPrice === 0) return null;
    const diff = ((currentPrice - catPrice) / catPrice) * 100;
    return diff;
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.importe, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) { toast.error('Debes seleccionar un proveedor válido.'); return; }
    
    setSaving(true);
    try {
      const payload = {
        solicitudId: scId,
        supplierId,
        locationId: solicitud.locationId,
        fechaEntregaEsperada: fechaEntregaEsperada ? new Date(fechaEntregaEsperada).toISOString() : undefined,
        subtotal,
        iva,
        total,
        items
      };
      const res = await createPurchaseOrder(payload);
      toast.success('Orden de compra generada exitosamente. Lista para ser revisada y enviada.');
      navigate(`/ordenes/${res.id}`);
    } catch(err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al guardar la orden');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Preparando conversor...</div>;
  if (!solicitud) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div>
           <h1 className="text-xl font-bold text-slate-800">Cerrar Cotización y Generar OC</h1>
           <p className="text-sm text-slate-500">Basado en la Solicitud SC-{solicitud.id?.slice(0, 8).toUpperCase()}</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Proveedor Seleccionado *</label>
            <select 
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            >
              <option value="">Selecciona al ganador de la cotización...</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} (RFC: {p.rfc})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Promesa de Entrega</label>
            <input 
              type="date"
              value={fechaEntregaEsperada}
              onChange={(e) => setFechaEntregaEsperada(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>
        </div>

        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4">Captura de Precios Finales</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm">
               <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                 <tr>
                   <th className="py-3 px-4 text-left">Producto Escogido</th>
                   <th className="py-3 px-4 text-left w-32">Cantidad</th>
                   <th className="py-3 px-4 text-left w-40">Precio U. (MXN)</th>
                   <th className="py-3 px-4 text-right w-32">Importe</th>
                 </tr>
               </thead>
               <tbody>
                 {items.map((item, index) => {
                   const diff = getPriceDiff(item.productId, item.precioUnitario);
                   const hasVariation = diff !== null && Math.abs(diff) > 5;

                   return (
                    <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{item.productName}</p>
                          <p className="text-xs text-slate-400">{item.productUnit}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input 
                          type="number" 
                          min="1" required step="any"
                          value={item.cantidadOrdenada}
                          onChange={(e) => handleQtyChange(index, parseFloat(e.target.value))}
                          className="w-24 p-1.5 border border-slate-300 rounded focus:border-emerald-500 text-center text-slate-700"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">$</span>
                            <input 
                              type="number" 
                              min="0" required step="any"
                              value={item.precioUnitario}
                              onChange={(e) => handlePriceChange(index, parseFloat(e.target.value))}
                              className={`w-full p-1.5 border rounded focus:border-emerald-500 text-right font-medium ${
                                hasVariation ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-300 text-slate-700'
                              }`}
                            />
                          </div>
                          {diff !== null && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-1 py-0.5 rounded-sm w-fit ${
                              diff === 0 ? 'bg-slate-100 text-slate-400' : 
                              diff > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {diff === 0 ? (
                                <span className="flex items-center gap-1">
                                  <Info className="w-2.5 h-2.5" /> Precio cat.
                                </span>
                              ) : (
                                <>
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs cat.
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        ${item.importe.toFixed(2)}
                      </td>
                    </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>

           <div className="mt-6 flex justify-end">
             <div className="w-full sm:w-64 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 border-b border-slate-200 pb-3">
                  <span>IVA (16%):</span>
                  <span className="font-mono">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-800">
                  <span>Total final:</span>
                  <span className="font-mono">${total.toFixed(2)}</span>
                </div>
             </div>
           </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
           <button 
             type="submit" 
             disabled={saving || items.length === 0}
             className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-bold text-sm shadow disabled:opacity-50"
           >
             {saving ? 'Procesando...' : 'Generar OC Borrador'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaOrden;
