import api from './api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const d = (r: any) => r.data;

export const getPerfiles = () => api.get('/perfiles').then(d);
export const createPerfil = (dto: { nombre: string; descripcion?: string; rol: string }) =>
  api.post('/perfiles', dto).then(d);
export const updatePerfil = (id: string, dto: Partial<{ nombre: string; descripcion: string; rol: string }>) =>
  api.patch(`/perfiles/${id}`, dto).then(d);
export const deletePerfil = (id: string) =>
  api.delete(`/perfiles/${id}`).then(d);
