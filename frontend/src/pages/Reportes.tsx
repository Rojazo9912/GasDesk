import { useState, useEffect } from 'react';
import { getGastosPorProveedor, getSCPorEstatus, getOCRecientes } from '../services/reports.service';
import api from '../services/api';

async function downloadExcel(endpoint: string, filename: string) {
  const res = await api.get(endpoint, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

function exportCSV(rows: any[], columns: { key: string; label: string }[], filename: string) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body = rows
    .map(r => columns.map(c => `"${r[c.key] ?? ''}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SC_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_NIVEL_1: 'Nivel 1',
  PENDIENTE_NIVEL_2: 'Nivel 2',
  PENDIENTE_NIVEL_3: 'Nivel 3',
  PENDIENTE_COMPRAS: 'Compras',
  EN_PROCESO: 'En proceso',
  COMPLETADA: 'Completada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
};

const SC_COLORS: Record<string, string> = {
  COMPLETADA: 'bg-emerald-100 text-emerald-700',
  RECHAZADA: 'bg-rose-100 text-rose-700',
  CANCELADA: 'bg-slate-100 text-slate-500',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  BORRADOR: 'bg-slate-100 text-slate-500',
};

const OC_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  BORRADOR:          { label: 'Borrador',          cls: 'bg-slate-100 text-slate-500' },
  ENVIADA:           { label: 'Enviada',           cls: 'bg-blue-100 text-blue-700' },
  RECIBIDA_PARCIAL:  { label: 'Parcial',           cls: 'bg-amber-100 text-amber-700' },
  COMPLETADA:        { label: 'Completada',        cls: 'bg-emerald-100 text-emerald-700' },
  CANCELADA:         { label: 'Cancelada',         cls: 'bg-rose-100 text-rose-700' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const Reportes = () => {
  const [tab, setTab] = useState<'gastos' | 'sc' | 'oc'>('gastos');

  // Gastos por proveedor
  const [gastos, setGastos] = useState<any[]>([]);
  const [loadingGastos, setLoadingGastos] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // SC por estatus
  const [scEstatus, setScEstatus] = useState<any[]>([]);
  const [loadingSC, setLoadingSC] = useState(true);

  // OC recientes
  const [ocList, setOcList] = useState<any[]>([]);
  const [loadingOC, setLoadingOC] = useState(true);

  useEffect(() => {
    setLoadingGastos(true);
    getGastosPorProveedor(desde || undefined, hasta || undefined)
      .then(setGastos)
      .catch(console.error)
      .finally(() => setLoadingGastos(false));
  }, [desde, hasta]);

  useEffect(() => {
    getSCPorEstatus()
      .then(setScEstatus)
      .catch(console.error)
      .finally(() => setLoadingSC(false));
    getOCRecientes()
      .then(setOcList)
      .catch(console.error)
      .finally(() => setLoadingOC(false));
  }, []);

  const tabs = [
    { id: 'gastos', label: 'Gastos por Proveedor' },
    { id: 'sc',     label: 'Solicitudes de Compra' },
    { id: 'oc',     label: 'Órdenes de Compra' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reportes</h2>
        <p className="text-sm text-slate-500 mt-1">Consulta y exporta información del ciclo de compras.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Gastos por Proveedor ── */}
      {tab === 'gastos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={e => setDesde(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={e => setHasta(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            {(desde || hasta) && (
              <button
                onClick={() => { setDesde(''); setHasta(''); }}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Limpiar filtros
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => downloadExcel(`/reports/gastos-proveedor/xlsx${desde || hasta ? `?desde=${desde}&hasta=${hasta}` : ''}`, 'gastos-proveedores.xlsx')}
                disabled={gastos.length === 0}
                className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 disabled:opacity-40 transition-colors"
              >
                ↓ Excel
              </button>
              <button
                onClick={() =>
                  exportCSV(
                    gastos.map(g => ({
                      nombre: g.supplier.nombre,
                      rfc: g.supplier.rfc,
                      totalOrdenes: g.totalOrdenes,
                      montoTotal: g.montoTotal.toFixed(2),
                    })),
                    [
                      { key: 'nombre',       label: 'Proveedor' },
                      { key: 'rfc',          label: 'RFC' },
                      { key: 'totalOrdenes', label: 'Órdenes' },
                      { key: 'montoTotal',   label: 'Monto Total' },
                    ],
                    'gastos_por_proveedor.csv',
                  )
                }
                disabled={gastos.length === 0}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                ↓ CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Proveedor</th>
                  <th className="px-6 py-4 font-medium">RFC</th>
                  <th className="px-6 py-4 font-medium text-right">No. Órdenes</th>
                  <th className="px-6 py-4 font-medium text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {loadingGastos ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                ) : gastos.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sin datos en el período seleccionado.</td></tr>
                ) : (
                  gastos.map((g, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{g.supplier.nombre}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{g.supplier.rfc}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{g.totalOrdenes}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">{fmt(g.montoTotal)}</td>
                    </tr>
                  ))
                )}
                {!loadingGastos && gastos.length > 0 && (
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="px-6 py-3 text-sm font-bold text-slate-700 text-right">Total</td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-700">
                      {fmt(gastos.reduce((s, g) => s + g.montoTotal, 0))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SC por Estatus ── */}
      {tab === 'sc' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => downloadExcel('/reports/sc-por-estatus/xlsx', 'sc-por-estatus.xlsx')}
              disabled={scEstatus.length === 0}
              className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 disabled:opacity-40 transition-colors"
            >
              ↓ Excel
            </button>
            <button
              onClick={() =>
                exportCSV(
                  scEstatus.map(s => ({ estatus: SC_LABELS[s.estatus] || s.estatus, total: s.total })),
                  [{ key: 'estatus', label: 'Estatus' }, { key: 'total', label: 'Total' }],
                  'solicitudes_por_estatus.csv',
                )
              }
              disabled={scEstatus.length === 0}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ↓ CSV
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Estatus</th>
                  <th className="px-6 py-4 font-medium text-right">Total SC</th>
                </tr>
              </thead>
              <tbody>
                {loadingSC ? (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                ) : scEstatus.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Sin solicitudes.</td></tr>
                ) : (
                  scEstatus.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${SC_COLORS[s.estatus] || 'bg-slate-100 text-slate-500'}`}>
                          {SC_LABELS[s.estatus] || s.estatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">{s.total}</td>
                    </tr>
                  ))
                )}
                {!loadingSC && scEstatus.length > 0 && (
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-6 py-3 text-sm font-bold text-slate-700 text-right">Total</td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-700">
                      {scEstatus.reduce((s, r) => s + r.total, 0)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── OC Recientes ── */}
      {tab === 'oc' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => downloadExcel('/reports/oc-recientes/xlsx', 'oc-recientes.xlsx')}
              disabled={ocList.length === 0}
              className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 disabled:opacity-40 transition-colors"
            >
              ↓ Excel
            </button>
            <button
              onClick={() =>
                exportCSV(
                  ocList.map(o => ({
                    folio: `OC-${String(o.folio).padStart(4, '0')}`,
                    fecha: fmtDate(o.fechaEmision),
                    proveedor: o.supplier?.nombre,
                    sucursal: o.location?.nombre,
                    estatus: OC_STATUS_LABELS[o.estatus]?.label || o.estatus,
                    total: o.total.toFixed(2),
                  })),
                  [
                    { key: 'folio',     label: 'Folio' },
                    { key: 'fecha',     label: 'Fecha' },
                    { key: 'proveedor', label: 'Proveedor' },
                    { key: 'sucursal',  label: 'Sucursal' },
                    { key: 'estatus',   label: 'Estatus' },
                    { key: 'total',     label: 'Total' },
                  ],
                  'ordenes_de_compra.csv',
                )
              }
              disabled={ocList.length === 0}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ↓ CSV
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Folio</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Proveedor</th>
                  <th className="px-6 py-4 font-medium">Sucursal</th>
                  <th className="px-6 py-4 font-medium">Estatus</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loadingOC ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                ) : ocList.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Sin órdenes de compra.</td></tr>
                ) : (
                  ocList.map(o => {
                    const st = OC_STATUS_LABELS[o.estatus] || { label: o.estatus, cls: 'bg-slate-100 text-slate-500' };
                    return (
                      <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                          OC-{String(o.folio).padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{fmtDate(o.fechaEmision)}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{o.supplier?.nombre}</td>
                        <td className="px-6 py-4 text-slate-500">{o.location?.nombre}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-800">{fmt(o.total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
