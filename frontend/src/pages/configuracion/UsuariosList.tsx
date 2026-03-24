import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getUsers, inviteUser, disableUser } from '../../services/users.service';
import { getPerfiles } from '../../services/perfiles.service';
import ConfirmModal from '../../components/shared/ConfirmModal';

const ROL_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  COMPRAS: 'Compras / Pagos',
  CONTRALOR: 'Contraloría',
  ALMACENISTA: 'Almacenista',
  SOLICITANTE: 'Solicitante',
};

const UsuariosList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState('SOLICITANTE');
  const [saving, setSaving] = useState(false);
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
    getPerfiles().then(setPerfiles).catch(() => {});
  }, []);

  const handleOpenModal = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRol('SOLICITANTE');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inviteUser({ nombre, email, password, rol });
      toast.success(`Usuario ${nombre} creado correctamente`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setSaving(false);
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
          + Nuevo Usuario
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Nuevo Usuario</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="usuario@empresa.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Contraseña * (mín. 8 caracteres)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$!';
                      const randomArray = new Uint32Array(12);
                      window.crypto.getRandomValues(randomArray);
                      const pwd = Array.from(randomArray, (num) => chars[num % chars.length]).join('');
                      setPassword(pwd);
                      setShowPassword(true);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Generar contraseña
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 pr-16 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
              {perfiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Perfil / Puesto</label>
                  <select
                    onChange={e => {
                      const p = perfiles.find(x => x.id === e.target.value);
                      if (p) setRol(p.rol);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">— Seleccionar perfil (opcional) —</option>
                    {perfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({ROL_LABELS[p.rol] ?? p.rol})</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Al seleccionar un perfil se pre-configura el nivel de acceso.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de acceso</label>
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
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? 'Creando...' : 'Crear Usuario'}
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
