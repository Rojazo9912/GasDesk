import { useState, useEffect } from 'react';
import { getMovements } from '../../services/inventory.service';
import { getLocations } from '../../services/locations.service';

const TIPO_LABELS: Record<string, { label: string; cls: string }> = {
  ENTRADA:  { label: 'Entrada',  cls: 'bg-emerald-100 text-emerald-700' },
  SALIDA:   { label: 'Salida',   cls: 'bg-rose-100 text-rose-700' },
  AJUSTE:   { label: 'Ajuste',   cls: 'bg-blue-100 text-blue-700' },
};

const Movimientos = () => {
  const [movements, setMovements] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState('');

  useEffect(() => {
    getLocations().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getMovements(locationId || undefined)
      .then(setMovements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Historial de Movimientos</h2>
          <p className="text-sm text-slate-500 mt-1">Entradas, salidas y ajustes de inventario.</p>
        </div>
        <select
          value={locationId}
          onChange={e => setLocationId(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        >
          <option value="">Todas las sucursales</option>
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium text-right">Cantidad</th>
              <th className="px-6 py-4 font-medium">Origen</th>
              <th className="px-6 py-4 font-medium">Notas</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Sin movimientos registrados.</td></tr>
            ) : (
              movements.map(m => {
                const tipo = TIPO_LABELS[m.tipo] || { label: m.tipo, cls: 'bg-slate-100 text-slate-700' };
                return (
                  <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(m.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tipo.cls}`}>{tipo.label}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {m.product.nombre}
                      <span className="text-xs text-slate-400 ml-1">({m.product.unidad})</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">{m.cantidad}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs capitalize">{m.origenTipo.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{m.notas || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Movimientos;
