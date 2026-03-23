import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPurchaseRequestById } from '../../services/purchase-requests.service';
import { getSuppliers } from '../../services/suppliers.service';
import { createPurchaseOrder } from '../../services/purchase-orders.service';

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
        alert('Error cargando los datos base para la orden');
        navigate('/ordenes');
      } finally {
        setLoading(false);
      }
    };
    if (scId) fetchData();
  }, [scId, navigate]);

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

  const subtotal = items.reduce((acc, curr) => acc + curr.importe, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return alert('Debes seleccionar un proveedor válido.');
    
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
      alert('Orden de compra generada exitosamente. Lista para ser revisada y enviada.');
      navigate(`/ordenes/${res.id}`);
    } catch(err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al guardar la orden');
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
                 {items.map((item, index) => (
                   <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                     <td className="py-3 px-4 font-medium">{item.productName} <span className="text-slate-400 font-normal ml-1">({item.productUnit})</span></td>
                     <td className="py-3 px-4">
                       <input 
                         type="number" 
                         min="1" required step="any"
                         value={item.cantidadOrdenada}
                         onChange={(e) => handleQtyChange(index, parseFloat(e.target.value))}
                         className="w-full p-1.5 border border-slate-300 rounded focus:border-emerald-500 text-center"
                       />
                     </td>
                     <td className="py-3 px-4 flex items-center gap-1">
                       <span className="text-slate-500">$</span>
                       <input 
                         type="number" 
                         min="0" required step="any"
                         value={item.precioUnitario}
                         onChange={(e) => handlePriceChange(index, parseFloat(e.target.value))}
                         className="w-full p-1.5 border border-slate-300 rounded focus:border-emerald-500 text-right"
                       />
                     </td>
                     <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                       ${item.importe.toFixed(2)}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           <div className="mt-6 flex justify-end">
             <div className="w-64 space-y-3">
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
