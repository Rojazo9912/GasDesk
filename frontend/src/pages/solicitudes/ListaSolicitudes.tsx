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

const estatusColor = (estatus: string) => {
  switch (estatus) {
    case 'BORRADOR': return 'bg-slate-100 text-slate-700';
    case 'PENDIENTE_COMPRAS': return 'bg-amber-100 text-amber-700';
    case 'EN_PROCESO': return 'bg-blue-100 text-blue-700';
    case 'COMPLETADA': return 'bg-emerald-100 text-emerald-700';
    case 'RECHAZADA': return 'bg-rose-100 text-rose-700';
    case 'CANCELADA': return 'bg-slate-200 text-slate-500';
    default:
      if (estatus.startsWith('PENDIENTE_NIVEL')) {
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      }
      return 'bg-slate-100 text-slate-700';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Solicitudes de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Monitorea y autoriza las peticiones de material de las estaciones.</p>
        </div>
        <Link
          to="/solicitudes/nueva"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          + Nueva Solicitud
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estatus</label>
            <select
              value={filtroEstatus}
              onChange={e => setFiltroEstatus(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {ESTATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estación / Sucursal</label>
            <select
              value={filtroLocation}
              onChange={e => setFiltroLocation(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todas las estaciones</option>
              {locationOptions.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
            <input
              type="date"
              value={filtroDesde}
              onChange={e => setFiltroDesde(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroHasta}
              onChange={e => setFiltroHasta(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {hayFiltros && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
            </span>
            <button
              onClick={limpiarFiltros}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Folio / Fecha</th>
                <th className="px-6 py-4 font-medium">Estación</th>
                <th className="px-6 py-4 font-medium">Solicitante</th>
                <th className="px-6 py-4 font-medium">Artículos</th>
                <th className="px-6 py-4 font-medium">Estatus</th>
                <th className="px-6 py-4 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando solicitudes...</td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {hayFiltros ? 'Sin resultados para los filtros aplicados.' : 'No hay solicitudes creadas aún.'}
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{formatarFolio(req.id)}</div>
                      <div className="text-xs text-slate-500 mt-1">{formatearFecha(req.creadoEn)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {req.location?.nombre || 'General'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {req.solicitante?.nombre}
                    </td>
                    <td className="px-6 py-4">
                      {req.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${estatusColor(req.estatus)}`}>
                        {req.estatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/solicitudes/${req.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
                        Ver detalle →
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

export default ListaSolicitudes;
