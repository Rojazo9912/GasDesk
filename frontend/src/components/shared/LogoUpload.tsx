import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface LogoUploadProps {
  tenantId: string;
  currentLogo?: string;
  onUpload: (url: string) => void;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const LogoUpload = ({ tenantId, currentLogo, onUpload }: LogoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('El archivo no debe superar 2 MB');
      return;
    }

    // Preview inmediato
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `${tenantId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      onUpload(data.publicUrl);
      toast.success('Logo subido correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al subir el logo');
      setPreview(currentLogo || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div
        className="h-16 w-32 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center bg-slate-50 overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Logo" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-xs text-slate-400 text-center px-2">Haz clic para subir</span>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-1">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="text-sm text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : preview ? 'Cambiar logo' : 'Subir logo'}
        </button>
        {preview && (
          <div>
            <button
              type="button"
              onClick={() => { setPreview(null); onUpload(''); }}
              className="text-xs text-slate-400 hover:text-rose-500"
            >
              Eliminar
            </button>
          </div>
        )}
        <p className="text-xs text-slate-400">PNG, JPG, SVG · máx. 2 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
};

export default LogoUpload;
