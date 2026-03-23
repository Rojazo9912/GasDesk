import { useState, useEffect } from 'react';
import { getStock } from '../../services/inventory.service';
import { getLocations } from '../../services/locations.service';

const StockActual = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState('');

  useEffect(() => {
    getLocations().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getStock(locationId || undefined)
      .then(setStock)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationId]);

  const lowStock = stock.filter(s => s.cantidad <= s.product.stockMinimo && s.product.stockMinimo > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Stock Actual</h2>
          <p className="text-sm text-slate-500 mt-1">Existencias por producto y sucursal.</p>
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

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 font-semibold text-sm">
            ⚠ {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo o agotado
          </p>
          <ul className="mt-2 space-y-1">
            {lowStock.map(s => (
              <li key={s.id} className="text-amber-700 text-xs">
                • {s.product.nombre} en {s.location.nombre}: {s.cantidad} {s.product.unidad}
                {s.cantidad === 0 && <span className="ml-2 font-bold text-rose-600">(AGOTADO)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Sucursal</th>
              <th className="px-6 py-4 font-medium text-right">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Mínimo</th>
              <th className="px-6 py-4 font-medium text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : stock.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Sin registros de inventario.</td></tr>
            ) : (
              stock.map(s => {
                const isLow = s.product.stockMinimo > 0 && s.cantidad <= s.product.stockMinimo;
                const isOut = s.cantidad === 0;
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 last:border-0 transition-colors ${isOut ? 'bg-rose-50' : isLow ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">{s.product.nombre}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{s.product.categoria}</td>
                    <td className="px-6 py-4 text-slate-600">{s.location.nombre}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      {s.cantidad} <span className="text-xs font-normal text-slate-400">{s.product.unidad}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {s.product.stockMinimo > 0 ? `${s.product.stockMinimo} ${s.product.unidad}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isOut ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Agotado</span>
                      ) : isLow ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Stock bajo</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">OK</span>
                      )}
                    </td>
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

export default StockActual;
