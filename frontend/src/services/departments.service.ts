import api from './api';

export const getDepartments = async () => {
  const { data } = await api.get('/departments');
  return data;
};

export const createDepartment = async (dto: { nombre: string; descripcion?: string }) => {
  const { data } = await api.post('/departments', dto);
  return data;
};

export const updateDepartment = async (id: string, dto: { nombre?: string; descripcion?: string }) => {
  const { data } = await api.patch(`/departments/${id}`, dto);
  return data;
};

export const deleteDepartment = async (id: string) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};
