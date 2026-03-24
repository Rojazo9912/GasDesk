import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseRequests } from '../../services/purchase-requests.service';

const ESTATUS_OPTIONS = [
  { value: '', label: 'Todos los estatus' },
  { value: 'PENDIENTE_NIVEL_1', label: 'Pendiente Nivel 1' },
  { value: 'PENDIENTE_NIVEL_2', label: 'Pendiente Nivel 2' },
  { value: 'PENDIENTE_NIVEL_3', label: 'Pendiente Nivel 3' },
  { value: 'PENDIENTE_COMPRAS', label: 'Pendiente Compras' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

type EstatusBadge = { emoji: string; label: string; className: string };

const getEstatusBadge = (estatus: string): EstatusBadge => {
  switch (estatus) {
    case 'BORRADOR':         return { emoji: '📝', label: 'Borrador',          className: 'bg-slate-100 text-slate-600 border-slate-200' };
    case 'PENDIENTE_COMPRAS':return { emoji: '🛒', label: 'Pend. Compras',     className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'EN_PROCESO':       return { emoji: '⚙️', label: 'En Proceso',        className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'COMPLETADA':       return { emoji: '✅', label: 'Completada',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'RECHAZADA':        return { emoji: '❌', label: 'Rechazada',         className: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'CANCELADA':        return { emoji: '🚫', label: 'Cancelada',         className: 'bg-slate-100 text-slate-500 border-slate-200' };
    default:
      if (estatus.startsWith('PENDIENTE_NIVEL')) {
        const nivel = estatus.replace('PENDIENTE_NIVEL_', '');
        return { emoji: '⏳', label: `Nivel ${nivel}`, className: 'bg-amber-50 text-amber-700 border-amber-200' };
      }
      return { emoji: '❓', label: estatus.replace(/_/g, ' '), className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
};

const formatarFolio = (id: string) => `SC-${id.slice(0, 8).toUpperCase()}`;

const ListaSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [filtroLocation, setFiltroLocation] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getPurchaseRequests();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error fetching solicitudes', error);
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = useMemo(() => {
    const seen = new Map<string, string>();
    solicitudes.forEach(s => {
      if (s.location?.nombre) seen.set(s.locationId, s.location.nombre);
    });
    return Array.from(seen.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [solicitudes]);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(s => {
      if (filtroEstatus && s.estatus !== filtroEstatus) return false;
      if (filtroLocation && s.locationId !== filtroLocation) return false;
      if (filtroDesde && new Date(s.creadoEn) < new Date(filtroDesde)) return false;
      if (filtroHasta) {
        const hasta = new Date(filtroHasta);
        hasta.setHours(23, 59, 59);
        if (new Date(s.creadoEn) > hasta) return false;
      }
      return true;
    });
  }, [solicitudes, filtroEstatus, filtroLocation, filtroDesde, filtroHasta]);

  const limpiarFiltros = () => {
    setFiltroEstatus('');
    setFiltroLocation('');
    setFiltroDesde('');
    setFiltroHasta('');
  };

  const hayFiltros = filtroEstatus || filtroLocation || filtroDesde || filtroHasta;

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Solicitudes de Compra</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitorea y autoriza las peticiones de material de las estaciones.</p>
        </div>
        <Link
          to="/solicitudes/nueva"
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
        >
          ✍️ Nueva Solicitud
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-slate-600">🔍 Filtros</span>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium ml-auto transition-colors"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Estatus</label>
            <select
              value={filtroEstatus}
              onChange={e => setFiltroEstatus(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 transition-all"
            >
              {ESTATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Estación / Sucursal</label>
            <select
              value={filtroLocation}
              onChange={e => setFiltroLocation(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 transition-all"
            >
              <option value="">Todas las estaciones</option>
              {locationOptions.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
            <input
              type="date"
              value={filtroDesde}
              onChange={e => setFiltroDesde(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroHasta}
              onChange={e => setFiltroHasta(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 transition-all"
            />
          </div>
        </div>
        {hayFiltros && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Mostrando <span className="font-bold text-slate-700">{solicitudesFiltradas.length}</span> de {solicitudes.length} solicitudes
            </span>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Folio / Fecha</th>
                <th className="px-5 py-3.5 font-semibold">📍 Estación</th>
                <th className="px-5 py-3.5 font-semibold">👤 Solicitante</th>
                <th className="px-5 py-3.5 font-semibold">Artículos</th>
                <th className="px-5 py-3.5 font-semibold">Estatus</th>
                <th className="px-5 py-3.5 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-5 py-3.5"><div className="skeleton h-4 w-20 mb-1" /><div className="skeleton h-3 w-16" /></td>
                    <td className="px-5 py-3.5"><div className="skeleton h-4 w-28" /></td>
                    <td className="px-5 py-3.5"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-5 py-3.5"><div className="skeleton h-4 w-12" /></td>
                    <td className="px-5 py-3.5"><div className="skeleton h-6 w-24 rounded-full" /></td>
                    <td className="px-5 py-3.5 text-right"><div className="skeleton h-7 w-24 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <span className="text-4xl">📭</span>
                      <span className="text-sm font-medium">{hayFiltros ? 'Sin resultados para los filtros aplicados.' : 'No hay solicitudes creadas aún.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((req, idx) => {
                  const badge = getEstatusBadge(req.estatus);
                  const stagger = `stagger-${Math.min(idx + 1, 8)}`;
                  return (
                    <tr key={req.id} className={`animate-row-in ${stagger} hover:bg-slate-50/80 transition-colors duration-150`}>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 font-mono text-xs">{formatarFolio(req.id)}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatearFecha(req.creadoEn)}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {req.location?.nombre || 'General'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {req.solicitante?.nombre}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <span className="font-semibold text-slate-700">{req.items?.length || 0}</span> items
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.className}`}>
                          <span>{badge.emoji}</span>
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/solicitudes/${req.id}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all duration-200"
                        >
                          Ver detalle →
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

export default ListaSolicitudes;
