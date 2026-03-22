import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPurchaseOrderById, sendPurchaseOrderEmail } from '../../services/purchase-orders.service';

// El estatus determinará los botones disponibles
const DetalleOrden = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [oc, setOc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      if (id) {
        const data = await getPurchaseOrderById(id);
        setOc(data);
      }
    } catch (error) {
      console.error(error);
      alert('Error cargando Órden de compra');
      navigate('/ordenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSendSupplier = async () => {
    if (!confirm('Esta acción convertirá el documento en PDF y enviará un correo firmado al proveedor. ¿Continuar?')) return;
    setSending(true);
    
    try {
      // PROCESO DE PDF LIVIANO POR PARTE DEL CLIENTE (MOCK / VISUAL)
      let fakeUrl = 'https://ejemplo.com/oc-generada.pdf';
      if (pdfRef.current) {
         // Aqui podríamos usar jsPDF para generar y subir al cloud 
         // En el MVP solo mandaremos una alerta y pasaremos el string al backend
         // const canvas = await html2canvas(pdfRef.current);
         // const imgData = canvas.toDataURL('image/png');
         console.log('PDF Snapshot logico capturado en base64 (omitiendo por payload size en DB local)');
         fakeUrl = 'https://gasdesk-cloud.com/docs/OC-' + oc.folio + '.pdf'; 
      }

      await sendPurchaseOrderEmail(id!, fakeUrl);
      alert('¡Órden enviada exitosamente!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando la captura...</div>;
  if (!oc) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       
       <div className="flex justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
         <div className="flex items-center gap-4">
           <button onClick={() => navigate('/ordenes')} className="text-slate-400 hover:text-slate-800 font-bold px-2 py-1 rounded hover:bg-slate-100">←</button>
           <h1 className="text-xl font-bold text-slate-800">OC-{oc.folio?.toString().padStart(4, '0') || 'N/A'}</h1>
           <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase rounded border border-blue-200">
             {oc.estatus.replace(/_/g, ' ')}
           </span>
         </div>
         <div className="flex gap-2">
            <button 
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded bg-slate-50 hover:bg-slate-100 text-sm font-semibold transition shadow-sm"
              onClick={() => window.print()}
            >
              🖨️ Imprimir Local
            </button>
            {oc.estatus === 'BORRADOR' && (
              <button 
                onClick={handleSendSupplier}
                disabled={sending}
                className="px-4 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 shadow-sm transition text-sm disabled:opacity-50"
              >
                {sending ? 'Generando PDF...' : 'Enviar Autorización al Proveedor'}
              </button>
            )}
         </div>
       </div>

       {/* DOCUMENTO RENDERIZADO VISIBLE (AQUI TOMA FOTO EL DOM) */}
       <div className="bg-white border rounded shadow-md overflow-hidden relative">
          <div ref={pdfRef} className="p-10 md:p-16 min-h-[800px] bg-white text-slate-800 print:shadow-none print:p-0">
             
             {/* Header */}
             <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                   <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Órden de Compra</h2>
                   <div className="text-slate-500 mt-2 font-medium">FOLIO: <span className="text-slate-800 font-mono">OC-{oc.folio?.toString().padStart(4,'0')}</span></div>
                   <div className="text-slate-500 font-medium">FECHA EMISIÓN: <span className="text-slate-800">{new Date(oc.fechaEmision).toLocaleDateString()}</span></div>
                </div>
                <div className="text-right">
                   <h3 className="text-xl font-bold text-emerald-600">GasDesk</h3>
                   <p className="text-sm text-slate-500 mt-1">Av. Las Torres 345, Monterrey NL.</p>
                   <p className="text-sm text-slate-500">RFC: XAXX010101000</p>
                </div>
             </div>

             {/* Addresses */}
             <div className="grid grid-cols-2 gap-10 mb-8 max-w-3xl">
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Proveedor Destino</h4>
                  <div className="font-bold text-slate-800">{oc.supplier?.nombre}</div>
                  <div className="text-sm mt-1">RFC: {oc.supplier?.rfc}</div>
                  <div className="text-sm mt-1 text-slate-600">Atención: {oc.supplier?.contactoNombre || oc.supplier?.contactoEmail}</div>
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Entregar En</h4>
                  <div className="font-bold text-slate-800">{oc.location?.nombre}</div>
                  <div className="text-sm mt-1 text-slate-600">Tipo de Oficina: {oc.location?.tipo}</div>
                  <div className="text-sm mt-1 text-slate-600">Condiciones: Entrega en horario de 9AM a 6PM</div>
                </div>
             </div>

             {/* Items Table */}
             <table className="w-full text-sm mb-8 border-collapse">
                <thead>
                   <tr className="bg-slate-100 uppercase text-slate-600 border-y border-slate-300">
                     <th className="py-2 px-3 text-left">Partida / Producto</th>
                     <th className="py-2 px-3 text-center">Unidad</th>
                     <th className="py-2 px-3 text-center">Cant.</th>
                     <th className="py-2 px-3 text-right">Costo Unitario</th>
                     <th className="py-2 px-3 text-right">Importe</th>
                   </tr>
                </thead>
                <tbody>
                   {oc.items?.map((item: any, idx: number) => (
                     <tr key={item.id} className="border-b border-slate-200">
                       <td className="py-3 px-3 font-medium">{idx + 1}. {item.product?.nombre}</td>
                       <td className="py-3 px-3 text-center">{item.product?.unidad}</td>
                       <td className="py-3 px-3 text-center font-bold">{item.cantidadOrdenada}</td>
                       <td className="py-3 px-3 text-right font-mono">${item.precioUnitario?.toFixed(2)}</td>
                       <td className="py-3 px-3 text-right font-mono font-bold">${item.importe?.toFixed(2)}</td>
                     </tr>
                   ))}
                </tbody>
             </table>

             {/* Footer Totals */}
             <div className="flex justify-end pt-4">
                <div className="w-72">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>SUBTOTAL</span>
                    <span className="font-mono">${oc.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>IVA (16%)</span>
                    <span className="font-mono">${oc.iva?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-800 mt-2 font-bold text-lg text-slate-900">
                    <span>TOTAL MXN</span>
                    <span className="font-mono">${oc.total?.toFixed(2)}</span>
                  </div>
                </div>
             </div>

          </div>
       </div>

    </div>
  );
};

export default DetalleOrden;
