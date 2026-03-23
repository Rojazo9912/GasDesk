import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getUsers, inviteUser, disableUser } from '../../services/users.service';
import ConfirmModal from '../../components/shared/ConfirmModal';

const UsuariosList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // From state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('SOLICITANTE');
  const [inviting, setInviting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; email: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = () => {
    setNombre('');
    setEmail('');
    setPassword(Math.random().toString(36).slice(-8)); // auto-generate temp pass
    setRol('SOLICITANTE');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteUser({ nombre, email, password, rol });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error inviting user', error);
      toast.error(error.response?.data?.message || 'Error al invitar al usuario');
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = (id: string, email: string) => setPendingDelete({ id, email });

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
    GERENTE: 'bg-teal-100 text-teal-700 border-teal-200',
    COMPRAS: 'bg-amber-100 text-amber-700 border-amber-200',
    ALMACENISTA: 'bg-orange-100 text-orange-700 border-orange-200',
    SOLICITANTE: 'bg-slate-100 text-slate-700 border-slate-200',
    CONTRALOR: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Usuarios y Roles</h2>
          <p className="text-sm text-slate-500">Administra el acceso de tu equipo a la plataforma.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Invitar Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Rol</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">No hay usuarios</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{u.nombre}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleColors[u.rol] || roleColors.SOLICITANTE}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.activo ? (
                      <span className="flex items-center text-emerald-600 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Activo</span>
                    ) : (
                      <span className="flex items-center text-slate-500 text-xs font-medium"><div className="w-2 h-2 rounded-full bg-slate-400 mr-2"></div> Inactivo</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {u.activo && (
                      <button 
                        onClick={() => handleDelete(u.id, u.email)}
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Invitar Nuevo Usuario</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="ADMIN">Administrador (Control total)</option>
                  <option value="GERENTE">Gerente de Sucursal</option>
                  <option value="COMPRAS">Compras / Pagos</option>
                  <option value="CONTRALOR">Contraloría</option>
                  <option value="ALMACENISTA">Almacenista</option>
                  <option value="SOLICITANTE">Solicitante (Sólo puede pedir)</option>
                </select>
              </div>
              <div className="bg-sky-50 text-sky-800 p-3 rounded-md text-xs border border-sky-100 flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>Se enviará un correo a este usuario con su contraseña temporal generada automáticamente.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={inviting}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={inviting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {inviting ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {pendingDelete && (
        <ConfirmModal
          title="¿Desactivar usuario?"
          message={`El usuario ${pendingDelete.email} perderá acceso a la plataforma.`}
          confirmLabel="Desactivar"
          danger
          onConfirm={async () => {
            const { id } = pendingDelete;
            setPendingDelete(null);
            try { await disableUser(id); fetchUsers(); } catch (e) { console.error(e); }
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};

export default UsuariosList;
