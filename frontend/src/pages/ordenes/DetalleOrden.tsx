import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getPurchaseOrderById, sendPurchaseOrderEmail } from '../../services/purchase-orders.service';
import { getInvoiceByOrden, createInvoice } from '../../services/invoices.service';
import { getReceptionsByOrden, createReception } from '../../services/receptions.service';
import ConfirmModal from '../../components/shared/ConfirmModal';
import FileUpload from '../../components/shared/FileUpload';
import { supabase } from '../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface CfdiData {
  uuid: string;
  rfcEmisor: string;
  fechaEmision: string;
  subtotal: number;
  iva: number;
  total: number;
}

const parseCfdiXml = (xmlText: string): CfdiData | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const comp = doc.documentElement;

    if (comp.nodeName === 'parsererror') return null;

    const subtotal = parseFloat(comp.getAttribute('SubTotal') || '0');
    const total = parseFloat(comp.getAttribute('Total') || '0');
    const fechaEmision = comp.getAttribute('Fecha') || '';

    const emisor =
      doc.getElementsByTagNameNS('http://www.sat.gob.mx/cfd/4', 'Emisor')[0] ||
      doc.getElementsByTagName('cfdi:Emisor')[0];
    const rfcEmisor = emisor?.getAttribute('Rfc') || '';

    const tfd =
      doc.getElementsByTagNameNS('http://www.sat.gob.mx/TimbreFiscalDigital', 'TimbreFiscalDigital')[0] ||
      doc.getElementsByTagName('tfd:TimbreFiscalDigital')[0];
    const uuid = tfd?.getAttribute('UUID') || '';

    const iva = parseFloat((total - subtotal).toFixed(2));

    if (!uuid || !rfcEmisor) return null;
    return { uuid, rfcEmisor, fechaEmision, subtotal, iva, total };
  } catch {
    return null;
  }
};

const validacionBadge = (estatus: string) => {
  switch (estatus) {
    case 'VALIDA': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'DIFERENCIA_MONTO': return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'RFC_INVALIDO': return 'bg-rose-100 text-rose-800 border border-rose-200';
    case 'UUID_DUPLICADO': return 'bg-rose-100 text-rose-800 border border-rose-200';
    default: return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const DetalleOrden = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [oc, setOc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel?: string; onConfirm: () => void } | null>(null);

  // Reception state
  const [recepciones, setRecepciones] = useState<any[]>([]);
  const [showRecepcionForm, setShowRecepcionForm] = useState(false);
  const [savingRecepcion, setSavingRecepcion] = useState(false);
  const [recepcionItems, setRecepcionItems] = useState<{ productId: string; cantidadRecibida: number; notas: string }[]>([]);
  const [recepcionNotas, setRecepcionNotas] = useState('');

  // CFDI state
  const [factura, setFactura] = useState<any>(null);
  const [cfdiData, setCfdiData] = useState<CfdiData | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [xmlUrl, setXmlUrl] = useState('');
  const [xmlError, setXmlError] = useState('');
  const [savingCfdi, setSavingCfdi] = useState(false);
  const [showCfdiForm, setShowCfdiForm] = useState(false);

  const fetchData = async () => {
    try {
      if (id) {
        const [ocData, facturaData, recepcionesData] = await Promise.all([
          getPurchaseOrderById(id),
          getInvoiceByOrden(id).catch(() => null),
          getReceptionsByOrden(id).catch(() => []),
        ]);
        setOc(ocData);
        setFactura(facturaData);
        setRecepciones(recepcionesData);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error cargando Órden de compra');
      navigate('/ordenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSendSupplier = () => {
    setConfirmModal({
      title: 'Enviar al proveedor',
      message: 'Se enviará un correo al proveedor con la orden de compra. ¿Continuar?',
      confirmLabel: 'Enviar',
      onConfirm: async () => {
        setConfirmModal(null);
        setSending(true);
        try {
          await sendPurchaseOrderEmail(id!);
          toast.success('¡Órden enviada exitosamente!');
          fetchData();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al enviar');
        } finally {
          setSending(false);
        }
      },
    });
  };

  const handleXmlFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setXmlError('');
    setCfdiData(null);
    setXmlUrl('');
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validar y parsear localmente para preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCfdiXml(text);
      if (!parsed) {
        setXmlError('El archivo no parece ser un CFDI válido (UUID o RFC no encontrados).');
        return;
      }
      setCfdiData(parsed);

      // 2. Subir a Supabase
      try {
        if (!supabase) throw new Error('Supabase no configurado');
        const path = `${user?.tenantId}/invoices/${new Date().getFullYear()}/${parsed.uuid}.xml`;
        const { error } = await supabase.storage.from('invoices').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(path);
        setXmlUrl(urlData.publicUrl);
      } catch (err: any) {
        toast.error('Error al subir XML: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitCfdi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cfdiData) return;
    setSavingCfdi(true);
    try {
      const saved = await createInvoice({
        ordenId: id!,
        folioFiscalUuid: cfdiData.uuid,
        rfcEmisor: cfdiData.rfcEmisor,
        fechaEmision: cfdiData.fechaEmision,
        subtotal: cfdiData.subtotal,
        iva: cfdiData.iva,
        total: cfdiData.total,
        xmlUrl: xmlUrl || undefined,
        pdfUrl: pdfUrl || undefined,
      });
      setFactura(saved);
      setShowCfdiForm(false);
      setCfdiData(null);
      setXmlUrl('');
      setPdfUrl('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar CFDI');
    } finally {
      setSavingCfdi(false);
    }
  };

  const openRecepcionForm = () => {
    setRecepcionItems(
      (oc?.items ?? []).map((item: any) => ({
        productId: item.productId,
        cantidadRecibida: item.cantidadOrdenada,
        notas: '',
      })),
    );
    setRecepcionNotas('');
    setShowRecepcionForm(true);
  };

  const handleSubmitRecepcion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingRecepcion(true);
    try {
      await createReception({
        ordenId: id!,
        notas: recepcionNotas || undefined,
        items: recepcionItems.filter(i => i.cantidadRecibida > 0),
      });
      setShowRecepcionForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar recepción');
    } finally {
      setSavingRecepcion(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando la captura...</div>;
  if (!oc) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/ordenes')} className="text-slate-400 hover:text-slate-800 font-bold px-2 py-1 rounded hover:bg-slate-100">←</button>
          {user?.tenant?.logo && (
            <img src={user.tenant.logo} alt="logo" className="h-8 object-contain max-w-[60px]" />
          )}
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">OC-{oc.folio?.toString().padStart(4, '0') || 'N/A'}</h1>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase rounded border border-blue-200">
            {oc.estatus.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-2 border border-slate-200 text-slate-600 rounded bg-slate-50 hover:bg-slate-100 text-sm font-semibold transition shadow-sm"
            onClick={() => window.print()}
          >
            Imprimir Local
          </button>
          {oc.estatus === 'BORRADOR' && (
            <button
              onClick={handleSendSupplier}
              disabled={sending}
              className="px-3 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 shadow-sm transition text-sm disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar al Proveedor'}
            </button>
          )}
        </div>
      </div>

      {/* Documento OC */}
      <div className="bg-white border rounded shadow-md overflow-hidden relative">
        <div ref={pdfRef} className="p-10 md:p-16 min-h-[800px] bg-white text-slate-800 print:shadow-none print:p-0">

          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div>
              <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Órden de Compra</h2>
              <div className="text-slate-500 mt-2 font-medium">FOLIO: <span className="text-slate-800 font-mono">OC-{oc.folio?.toString().padStart(4, '0')}</span></div>
              <div className="text-slate-500 font-medium">FECHA EMISIÓN: <span className="text-slate-800">{new Date(oc.fechaEmision).toLocaleDateString()}</span></div>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-emerald-600">GasDesk</h3>
              <p className="text-sm text-slate-500 mt-1">Av. Las Torres 345, Monterrey NL.</p>
              <p className="text-sm text-slate-500">RFC: XAXX010101000</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 mb-8 max-w-3xl">
            <div>
              <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Proveedor Destino</h4>
              <div className="font-bold text-slate-800">{oc.supplier?.nombre}</div>
              <div className="text-sm mt-1">RFC: {oc.supplier?.rfc}</div>
              <div className="text-sm mt-1 text-slate-600">Atención: {oc.supplier?.contactoNombre || oc.supplier?.contactoEmail}</div>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Entregar En</h4>
              <div className="font-bold text-slate-800">{oc.location?.nombre}</div>
              <div className="text-sm mt-1 text-slate-600">Tipo: {oc.location?.tipo}</div>
              <div className="text-sm mt-1 text-slate-600">Horario: 9AM a 6PM</div>
            </div>
          </div>

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

      {/* ─── Sección CFDI ──────────────────────────────────────────────────── */}
      {oc.estatus !== 'BORRADOR' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm print:hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Factura CFDI</h2>
            {!factura && !showCfdiForm && (
              <button
                onClick={() => setShowCfdiForm(true)}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-medium transition"
              >
                + Subir CFDI
              </button>
            )}
          </div>

          {/* Factura ya registrada */}
          {factura && (
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${validacionBadge(factura.estatusValidacion)}`}>
                  {factura.estatusValidacion.replace(/_/g, ' ')}
                </span>
                {factura.validadoPorSAT ? (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ✓ Verificado SAT
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    Sin verificar SAT
                  </span>
                )}
                {factura.notasValidacion && (
                  <span className="text-sm text-amber-700">{factura.notasValidacion}</span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">UUID Fiscal</p>
                  <p className="font-mono text-slate-800 text-xs break-all">{factura.folioFiscalUuid}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Fecha Emisión</p>
                  <p className="text-slate-800">{new Date(factura.fechaEmision).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Total CFDI</p>
                  <p className="font-mono font-bold text-slate-800">${factura.total?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Total OC</p>
                  <p className="font-mono text-slate-600">${oc.total?.toFixed(2)}</p>
                </div>
              </div>
              {factura.pdfUrl && (
                <a href={factura.pdfUrl} target="_blank" rel="noreferrer"
                  className="inline-block text-sm text-blue-600 hover:underline">
                  Ver PDF de factura →
                </a>
              )}
            </div>
          )}

          {/* Formulario de carga */}
          {showCfdiForm && !factura && (
            <form onSubmit={handleSubmitCfdi} className="p-6 space-y-6">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Archivo XML del CFDI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".xml"
                  required
                  onChange={handleXmlFile}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {xmlError && <p className="mt-2 text-sm text-rose-600">{xmlError}</p>}
              </div>

              {/* Vista previa */}
              {cfdiData && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Vista previa — datos extraídos del XML</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">UUID</p>
                      <p className="font-mono text-xs text-slate-800 break-all">{cfdiData.uuid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">RFC Emisor</p>
                      <p className="font-mono text-slate-800">{cfdiData.rfcEmisor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Fecha</p>
                      <p className="text-slate-800">{cfdiData.fechaEmision?.slice(0, 10)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Subtotal</p>
                      <p className="font-mono text-slate-800">${cfdiData.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">IVA</p>
                      <p className="font-mono text-slate-800">${cfdiData.iva.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Total</p>
                      <p className={`font-mono font-bold ${Math.abs(cfdiData.total - oc.total) / oc.total > 0.05 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        ${cfdiData.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {Math.abs(cfdiData.total - oc.total) / oc.total > 0.05 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                      El total del CFDI difiere más del 5% del total de la OC (${oc.total.toFixed(2)}).
                    </div>
                  )}
                  {cfdiData.rfcEmisor !== oc.supplier?.rfc && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                      RFC del CFDI ({cfdiData.rfcEmisor}) no coincide con el proveedor ({oc.supplier?.rfc}).
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Archivo PDF de Factura</label>
                  <FileUpload 
                    bucket="invoices"
                    pathPrefix={`${user?.tenantId}/invoices/${new Date().getFullYear()}`}
                    allowedTypes={['application/pdf']}
                    label="Subir PDF"
                    onUpload={setPdfUrl}
                  />
                </div>
                {pdfUrl && (
                  <div className="flex items-end pb-2">
                    <span className="text-xs text-emerald-600 font-medium">✓ PDF listo</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowCfdiForm(false); setCfdiData(null); setXmlError(''); }}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCfdi || !cfdiData}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded disabled:opacity-50"
                >
                  {savingCfdi ? 'Guardando...' : 'Registrar CFDI'}
                </button>
              </div>
            </form>
          )}

          {/* Placeholder sin factura y sin form abierto */}
          {!factura && !showCfdiForm && (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">
              Sube el XML del CFDI una vez que el proveedor entregue la factura.
            </div>
          )}
        </div>
      )}

      {/* ─── Sección Recepción de Mercancía ────────────────────────────── */}
      {oc.estatus !== 'BORRADOR' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm print:hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Recepción de Mercancía</h2>
            {!showRecepcionForm && oc.estatus !== 'COMPLETADA' && (
              <button
                onClick={openRecepcionForm}
                className="text-sm bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded font-medium transition"
              >
                + Registrar Recepción
              </button>
            )}
          </div>

          {/* Recepciones existentes */}
          {recepciones.length > 0 && (
            <div className="p-6 space-y-4">
              {recepciones.map((r: any) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-semibold text-slate-700">
                      Recibido el {new Date(r.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-400">Almacenista: {r.almacenista?.nombre}</div>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase border-b border-slate-100">
                        <th className="py-1 text-left font-medium">Producto</th>
                        <th className="py-1 text-right font-medium">Cantidad Recibida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.items?.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-1.5 text-slate-700">{item.product?.nombre}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-800">
                            {item.cantidadRecibida} <span className="font-normal text-slate-400">{item.product?.unidad}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.notas && <p className="mt-2 text-xs text-slate-400">Nota: {r.notas}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Formulario de recepción */}
          {showRecepcionForm && (
            <form onSubmit={handleSubmitRecepcion} className="p-6 space-y-5">
              <p className="text-sm text-slate-500">Ingresa las cantidades físicamente recibidas. Se actualizará el inventario automáticamente.</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Cant. Ordenada</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Cant. Recibida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recepcionItems.map((item, idx) => {
                      const ocItem = oc.items?.find((i: any) => i.productId === item.productId);
                      return (
                        <tr key={item.productId} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-slate-800">{ocItem?.product?.nombre}</td>
                          <td className="px-4 py-3 text-center text-slate-500">
                            {ocItem?.cantidadOrdenada} <span className="text-xs">{ocItem?.product?.unidad}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={item.cantidadRecibida}
                              onChange={e => {
                                const updated = [...recepcionItems];
                                updated[idx] = { ...updated[idx], cantidadRecibida: Number(e.target.value) };
                                setRecepcionItems(updated);
                              }}
                              className="w-24 border border-slate-300 rounded px-2 py-1 text-sm text-center focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas de recepción</label>
                <input
                  type="text"
                  value={recepcionNotas}
                  onChange={e => setRecepcionNotas(e.target.value)}
                  placeholder="Ej: Producto con empaque dañado, entregado incompleto..."
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRecepcionForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingRecepcion}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded disabled:opacity-50"
                >
                  {savingRecepcion ? 'Guardando...' : 'Confirmar Recepción'}
                </button>
              </div>
            </form>
          )}

          {/* Placeholder */}
          {recepciones.length === 0 && !showRecepcionForm && (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">
              Sin recepciones registradas aún.
            </div>
          )}
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default DetalleOrden;
