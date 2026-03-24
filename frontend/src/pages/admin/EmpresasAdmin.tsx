import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getTenants, createTenant, updateTenant } from '../../services/tenants.service';
import { supabase } from '../../lib/supabase';

const emptyForm = {
  nombre: '',
  rfc: '',
  plan: 'basico',
  adminNombre: '',
  adminEmail: '',
  adminPassword: '',
};

const planLabels: Record<string, string> = {
  basico: 'Básico',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const EmpresasAdmin = () => {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await getTenants();
      setEmpresas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('El logo no debe superar 2 MB'); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = e => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await createTenant({
        nombre: form.nombre,
        rfc: form.rfc.toUpperCase(),
        plan: form.plan,
        adminUser: {
          nombre: form.adminNombre,
          email: form.adminEmail,
          password: form.adminPassword,
        },
      });

      // Upload logo if selected
      if (logoFile && result.id && supabase) {
        const ext = logoFile.name.split('.').pop() ?? 'png';
        const path = `${result.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true, contentType: logoFile.type });
        if (!error) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
          await updateTenant(result.id, { logo: urlData.publicUrl });
        }
      }

      toast.success(`Empresa "${form.nombre}" creada correctamente`);
      setModalOpen(false);
      setForm(emptyForm);
      setLogoFile(null);
      setLogoPreview(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear la empresa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Empresas</h1>
          <p className="text-sm text-slate-500 mt-1">Administra las empresas registradas en GasDesk.</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setLogoFile(null); setLogoPreview(null); setModalOpen(true); }}
          className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          + Nueva Empresa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Empresa</th>
              <th className="px-6 py-4 font-medium">RFC</th>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium">Usuarios</th>
              <th className="px-6 py-4 font-medium">Sucursales</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : empresas.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Sin empresas registradas.</td></tr>
            ) : (
              empresas.map(e => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {e.logo && <img src={e.logo} alt="logo" className="h-8 w-12 object-contain rounded border border-slate-100" />}
                      <span className="font-medium text-slate-800">{e.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{e.rfc}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {planLabels[e.plan] ?? e.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{e._count?.usuarios ?? '-'}</td>
                  <td className="px-6 py-4 text-slate-500">{e._count?.sucursales ?? '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {e.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(e.creadoEn).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Nueva Empresa</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Datos de la empresa */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Datos de la empresa</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre comercial / Razón social *</label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                      placeholder="Ej. Gas del Norte S.A. de C.V."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">RFC *</label>
                      <input
                        type="text"
                        required
                        value={form.rfc}
                        onChange={e => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none font-mono"
                        placeholder="XXXX000000XX0"
                        maxLength={13}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                      <select
                        value={form.plan}
                        onChange={e => setForm({ ...form, plan: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white"
                      >
                        <option value="basico">Básico</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo (opcional)</label>
                    <div className="flex items-center gap-4">
                      <div
                        className="h-14 w-24 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {logoPreview
                          ? <img src={logoPreview} alt="preview" className="h-full w-full object-contain p-1" />
                          : <span className="text-xs text-slate-400 text-center px-1">Clic para subir</span>
                        }
                      </div>
                      <div className="text-xs text-slate-400">PNG, JPG, SVG · máx. 2 MB</div>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleLogoSelect(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Administrador inicial */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Administrador inicial</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      required
                      value={form.adminNombre}
                      onChange={e => setForm({ ...form, adminNombre: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                      placeholder="Nombre del administrador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.adminEmail}
                      onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
                      placeholder="admin@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña * (mín. 8 caracteres)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={form.adminPassword}
                        onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                        className="w-full p-2 pr-16 border border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
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
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-50">
                  {saving ? 'Creando...' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasAdmin;
