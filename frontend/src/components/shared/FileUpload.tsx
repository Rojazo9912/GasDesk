import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface FileUploadProps {
  bucket: string;
  pathPrefix: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  onUpload: (url: string) => void;
}

const FileUpload = ({ 
  bucket, 
  pathPrefix, 
  allowedTypes = ['application/pdf', 'text/xml', 'image/*'], 
  maxSizeMB = 5,
  label = 'Subir archivo',
  onUpload 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validar tipo
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      toast.error(`Tipo de archivo no permitido (${file.type})`);
      return;
    }

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo supera el límite de ${maxSizeMB} MB`);
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      if (!supabase) {
        throw new Error('Supabase no configurado');
      }

      const finalPath = `${pathPrefix}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(finalPath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (error) throw error;

      // Para buckets privados o públicos, devolvemos la URL pública si es posible 
      // o simplemente el path para que el backend genere la URL firmada.
      // En GasDesk, usaremos URLs públicas para logos y firmadas para el resto.
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(finalPath);
      onUpload(data.publicUrl);
      
      toast.success('Archivo subido con éxito');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al subir archivo');
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className={`
          relative border-2 border-dashed rounded-xl p-4 transition-all duration-200
          ${uploading ? 'bg-slate-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-emerald-400 group'}
          flex flex-col items-center justify-center text-center cursor-pointer
        `}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          {uploading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <span>📄</span>
          )}
        </div>
        <div className="text-sm font-medium text-slate-700">
          {uploading ? 'Subiendo...' : fileName ? fileName : label}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {allowedTypes.join(', ').replace(/image\/\*/g, 'Imágenes')} · Máx {maxSizeMB}MB
        </p>

        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      
      {fileName && !uploading && (
        <button 
          type="button"
          onClick={() => { setFileName(null); onUpload(''); }}
          className="text-xs text-rose-500 hover:underline px-1"
        >
          Remover archivo
        </button>
      )}
    </div>
  );
};

export default FileUpload;
