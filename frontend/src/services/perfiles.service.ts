import api from '../lib/api';

export const getPerfiles = () => api.get('/perfiles').then(r => r.data);
export const createPerfil = (dto: { nombre: string; descripcion?: string; rol: string }) =>
  api.post('/perfiles', dto).then(r => r.data);
export const updatePerfil = (id: string, dto: Partial<{ nombre: string; descripcion: string; rol: string }>) =>
  api.patch(`/perfiles/${id}`, dto).then(r => r.data);
export const deletePerfil = (id: string) => api.delete(`/perfiles/${id}`).then(r => r.data);
