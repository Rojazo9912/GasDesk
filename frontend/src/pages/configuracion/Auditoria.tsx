import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  Tag, 
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
  id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  camposModificados: any;
  fecha: string;
  user: {
    nombre: string;
    email: string;
  } | null;
}

const Auditoria = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entidad, setEntidad] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [entidad]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit-log', {
        params: { entidad }
      });
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (accion: string) => {
    switch (accion) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Filtrar por entidad (ej. User, Product...)"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium">
          <Filter className="w-4 h-4" />
          Más filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fecha y Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Acción</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Entidad</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {format(new Date(log.fecha), 'dd MMM yyyy', { locale: es })}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(log.fecha), 'HH:mm:ss')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                          {log.user?.nombre?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{log.user?.nombre || 'Sistema'}</p>
                          <p className="text-xs text-slate-400">{log.user?.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getActionColor(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600">{log.entidad}</span>
                        <span className="text-[10px] text-slate-400">#{log.entidadId.split('-')[0]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Mostrando {logs.length} registros recientes</p>
          <div className="flex gap-2">
            <button disabled className="p-1 text-slate-300"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled className="p-1 text-slate-300"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detalle de Modificación</h3>
                <p className="text-xs text-slate-500">{selectedLog.entidad} ID: {selectedLog.entidadId}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50">
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{JSON.stringify(selectedLog.camposModificados, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auditoria;
