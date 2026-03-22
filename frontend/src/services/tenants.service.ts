import api from './api';

export const getTenant = async (id: string) => {
  const { data } = await api.get(`/tenants/${id}`);
  return data;
};

export const updateTenant = async (id: string, updateData: any) => {
  const { data } = await api.patch(`/tenants/${id}`, updateData);
  return data;
};
