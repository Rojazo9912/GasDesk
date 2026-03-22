import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../../services/locations.service';
import { createPurchaseRequest } from '../../services/purchase-requests.service';
// Simulando un posible product service si lo tuvieramos, sino estáticos (TODO)
import api from '../../services/api';

const CrearSolicitud = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [locationId, setLocationId] = useState('');
  const [notas, setNotas] = useState('');
  
  // Maestro-detalle de partidas
  const [items, setItems] = useState<any[]>([{ productoId: '', cantidad: 1, justificacion: '' }]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [locs, prods] = await Promise.all([
        getLocations(),
        api.get('/products').then(res => res.data)
      ]);
      setLocations(locs.filter((l: any) => l.activo));
      setProducts(prods.filter((p: any) => p.activo));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productoId: '', cantidad: 1, justificacion: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || items.some(i => !i.productoId || i.cantidad < 1)) {
      alert('Por favor completa todos los campos requeridos y selecciona al menos un producto válido.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        locationId,
        notas,
        items
      };
      const res = await createPurchaseRequest(payload);
      alert('Solicitud enviada correctamente');
      navigate(`/solicitudes/${res.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear la SC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nueva Solicitud de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Requiere insumos, uniformes o material operativo para tu estación.</p>
        </div>
        <button onClick={() => navigate('/solicitudes')} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Volver a la lista</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-8">
        {/* Generales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal / Destino *</label>
              <select 
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
              >
                <option value="">Selecciona la sucursal</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.nombre} ({loc.tipo})</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de la requisición (Opcional)</label>
              <textarea 
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Explica brevemente por qué se están pidiendo estos artículos a nivel general"
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <h3 className="text-lg font-semibold text-slate-800">Conceptos a Solicitar *</h3>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              + Agregar Concepto
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 p-4 rounded-md border border-slate-100 relative">
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(index)}
                  className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  disabled={items.length === 1}
                >✕</button>
                
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Artículo</label>
                  <select 
                    required
                    value={item.productoId}
                    onChange={(e) => handleItemChange(index, 'productoId', e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Buscar insumo en catálogo...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full md:w-32">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cantidad</label>
                  <input 
                    type="number" 
                    required min="1" step="any"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value))}
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Justificación individual</label>
                  <input 
                    type="text" 
                    required
                    placeholder="¿Para qué se usará?"
                    value={item.justificacion}
                    onChange={(e) => handleItemChange(index, 'justificacion', e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File upload dummy */}
        <div className="bg-amber-50 rounded p-4 text-amber-800 text-sm border border-amber-200">
          <div className="font-bold mb-1">📎 Adjuntar Cotización o Evidencia</div>
          La subida de archivos (Supabase Storage) está desactivada para esta iteración rápida.
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md font-bold tracking-wide transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud a Aprobación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearSolicitud;
