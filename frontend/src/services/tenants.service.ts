import api from './api';

export const getTenant = async (id: string) => {
  const { data } = await api.get(`/tenants/${id}`);
  return data;
};

export const updateTenant = async (id: string, updateData: any) => {
  const { data } = await api.patch(`/tenants/${id}`, updateData);
  return data;
};

export const getTenants = async () => {
  const { data } = await api.get('/tenants');
  return data;
};

export const createTenant = async (dto: {
  nombre: string;
  rfc: string;
  plan?: string;
  adminUser: { nombre: string; email: string; password: string };
}) => {
  const { data } = await api.post('/tenants', dto);
  return data;
};
