import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDeptStock, getDeptMovements, adjustDeptInventory } from '../../services/department-inventory.service';
import { getDepartments } from '../../services/departments.service';
import { getProducts } from '../../services/products.service';

const tipoLabels: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

const tipoColors: Record<string, string> = {
  ENTRADA: 'bg-emerald-100 text-emerald-700',
  SALIDA: 'bg-rose-100 text-rose-700',
  AJUSTE: 'bg-amber-100 text-amber-700',
};

const StockDepartamentos = () => {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [stock, setStock] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'movimientos'>('stock');

  // Modal de ajuste
  const [adjustModal, setAdjustModal] = useState<{ item: any } | null>(null);
  const [adjustForm, setAdjustForm] = useState({ tipo: 'ENTRADA', cantidad: '', notas: '' });
  const [adjusting, setSaving] = useState(false);

  // Modal agregar producto
  const [addModal, setAddModal] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [addForm, setAddForm] = useState({ productId: '', cantidad: '', notas: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getDepartments().then(setDepartamentos).catch(console.error);
    getProducts().then(setProductos).catch(console.error);
  }, []);

  useEffect(() => {
    if (!departmentId) { setStock([]); setMovimientos([]); return; }
    setLoading(true);
    Promise.all([
      getDeptStock(departmentId),
      getDeptMovements(departmentId),
    ]).then(([s, m]) => { setStock(s); setMovimientos(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [departmentId]);

  const refreshData = () => {
    if (!departmentId) return;
    Promise.all([getDeptStock(departmentId), getDeptMovements(departmentId)])
      .then(([s, m]) => { setStock(s); setMovimientos(m); })
      .catch(console.error);
  };

  const handleAdjust = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustModal) return;
    const qty = parseFloat(adjustForm.cantidad);
    if (isNaN(qty) || qty <= 0) { toast.error('Cantidad inválida'); return; }
    setSaving(true);
    try {
      const cantidad = adjustForm.tipo === 'SALIDA' ? -qty : qty;
      await adjustDeptInventory({
        departmentId,
        productId: adjustModal.item.productId,
        cantidad,
        notas: adjustForm.notas || undefined,
      });
      toast.success('Stock actualizado');
      setAdjustModal(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al ajustar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const qty = parseFloat(addForm.cantidad);
    if (!addForm.productId) { toast.error('Selecciona un producto'); return; }
    setAdding(true);
    try {
      await adjustDeptInventory({
        departmentId,
        productId: addForm.productId,
        cantidad: isNaN(qty) ? 0 : qty,
        notas: addForm.notas || undefined,
      });
      toast.success('Producto agregado al inventario del departamento');
      setAddModal(false);
      setAddForm({ productId: '', cantidad: '', notas: '' });
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al agregar producto');
    } finally {
      setAdding(false);
    }
  };

  const lowStock = stock.filter(s => s.stockMinimo > 0 && s.cantidad <= s.stockMinimo);

  const productosDisponibles = productos.filter(
    p => !stock.some(s => s.productId === p.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inventario por Departamento</h2>
          <p className="text-sm text-slate-500 mt-1">Stock y movimientos por área o departamento.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none min-w-[200px]"
          >
            <option value="">— Seleccionar departamento —</option>
            {departamentos.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
          {departmentId && (
            <button
              onClick={() => { setAddModal(true); setAddForm({ productId: '', cantidad: '', notas: '' }); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
            >
              + Agregar producto
            </button>
          )}
        </div>
      </div>

      {!departmentId ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400">
          Selecciona un departamento para ver su inventario.
        </div>
      ) : (
        <>
          {/* Alertas de stock bajo */}
          {lowStock.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 font-semibold text-sm">
                ⚠ {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo o agotado
              </p>
              <ul className="mt-2 space-y-1">
                {lowStock.map(s => (
                  <li key={s.id} className="text-amber-700 text-xs">
                    • {s.product.nombre}: {s.cantidad} {s.product.unidad}
                    {s.cantidad === 0 && <span className="ml-2 font-bold text-rose-600">(AGOTADO)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
              {(['stock', 'movimientos'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'stock' ? 'Stock actual' : 'Historial de movimientos'}
                </button>
              ))}
            </nav>
          </div>

          {/* Stock Tab */}
          {activeTab === 'stock' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Producto</th>
                    <th className="px-6 py-4 font-medium">Categoría</th>
                    <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                    <th className="px-6 py-4 font-medium text-center">Estado</th>
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                  ) : stock.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Sin productos en este departamento.</td></tr>
                  ) : (
                    stock.map(s => {
                      const isLow = s.stockMinimo > 0 && s.cantidad <= s.stockMinimo;
                      const isOut = s.cantidad === 0;
                      return (
                        <tr key={s.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${isOut ? 'bg-rose-50' : isLow ? 'bg-amber-50' : ''}`}>
                          <td className="px-6 py-4 font-medium text-slate-800">{s.product.nombre}</td>
                          <td className="px-6 py-4 text-slate-500">{s.product.categoria}</td>
                          <td className="px-6 py-4 text-right font-mono">
                            {s.cantidad} <span className="text-xs text-slate-400">{s.product.unidad}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isOut ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-medium">Agotado</span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Stock bajo</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">OK</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setAdjustModal({ item: s });
                                setAdjustForm({ tipo: 'ENTRADA', cantidad: '', notas: '' });
                              }}
                              className="text-emerald-600 hover:text-emerald-800 font-medium text-xs uppercase"
                            >
                              Ajustar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Movimientos Tab */}
          {activeTab === 'movimientos' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium">Producto</th>
                    <th className="px-6 py-4 font-medium text-center">Tipo</th>
                    <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                    <th className="px-6 py-4 font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                  ) : movimientos.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Sin movimientos registrados.</td></tr>
                  ) : (
                    movimientos.map(m => (
                      <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(m.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{m.product.nombre}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${tipoColors[m.tipo]}`}>
                            {tipoLabels[m.tipo]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {m.tipo === 'SALIDA' ? '-' : '+'}{m.cantidad} <span className="text-xs text-slate-400">{m.product.unidad}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{m.notas || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal: Ajustar stock */}
      {adjustModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Ajustar: {adjustModal.item.product.nombre}</h3>
              <button onClick={() => setAdjustModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de movimiento</label>
                <select
                  value={adjustForm.tipo}
                  onChange={e => setAdjustForm({ ...adjustForm, tipo: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="ENTRADA">Entrada (+)</option>
                  <option value="SALIDA">Salida (-)</option>
                  <option value="AJUSTE">Ajuste (establecer)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={adjustForm.cantidad}
                  onChange={e => setAdjustForm({ ...adjustForm, cantidad: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-xs text-slate-400 mt-1">Stock actual: {adjustModal.item.cantidad} {adjustModal.item.product.unidad}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <input
                  type="text"
                  value={adjustForm.notas}
                  onChange={e => setAdjustForm({ ...adjustForm, notas: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAdjustModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancelar
                </button>
                <button type="submit" disabled={adjusting} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-50">
                  {adjusting ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar producto */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Agregar producto al departamento</h3>
              <button onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Producto *</label>
                <select
                  required
                  value={addForm.productId}
                  onChange={e => setAddForm({ ...addForm, productId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="">— Seleccionar —</option>
                  {productosDisponibles.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                  ))}
                </select>
                {productosDisponibles.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Todos los productos del catálogo ya están en este departamento.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad inicial</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.cantidad}
                  onChange={e => setAddForm({ ...addForm, cantidad: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <input
                  type="text"
                  value={addForm.notas}
                  onChange={e => setAddForm({ ...addForm, notas: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancelar
                </button>
                <button type="submit" disabled={adding} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-50">
                  {adding ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDepartamentos;
