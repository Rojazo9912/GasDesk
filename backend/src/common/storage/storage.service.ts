import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !key || url.includes('tu-proyecto')) {
      this.logger.warn('Supabase Storage no está configurado correctamente en .env');
      return;
    }

    this.supabase = createClient(url, key);
    this.logger.log('Supabase Storage cliente inicializado');
  }

  /**
   * Sube un archivo a un bucket específico
   */
  async uploadFile(bucket: string, path: string, fileBuffer: Buffer, contentType: string) {
    if (!this.supabase) throw new Error('Storage no configurado');

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error al subir archivo a ${bucket}/${path}: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Obtiene la URL pública (para buckets públicos como logos)
   */
  getPublicUrl(bucket: string, path: string) {
    if (!this.supabase) throw new Error('Storage no configurado');
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Obtiene una URL firmada para archivos privados
   */
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    if (!this.supabase) throw new Error('Storage no configurado');

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      this.logger.error(`Error al generar URL firmada para ${bucket}/${path}: ${error.message}`);
      throw error;
    }

    return data.signedUrl;
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(bucket: string, path: string) {
    if (!this.supabase) throw new Error('Storage no configurado');

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      this.logger.error(`Error al eliminar archivo ${bucket}/${path}: ${error.message}`);
      throw error;
    }

    return true;
  }
}
