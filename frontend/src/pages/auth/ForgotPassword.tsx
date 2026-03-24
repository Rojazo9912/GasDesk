import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📬</div>
            <p className="text-sm text-slate-700 font-medium">
              Si existe una cuenta con ese correo, recibirás un enlace en breve.
            </p>
            <Link to="/login" className="text-sm text-emerald-600 hover:underline font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@estacion.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
