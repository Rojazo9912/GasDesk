import api from './api';

export const getTenant = async (id: string) => {
  try {
    const { data } = await api.get(`/tenants/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching tenant ${id}:`, error);
    throw error;
  }
};

export const updateTenant = async (id: string, updateData: any) => {
  try {
    const { data } = await api.patch(`/tenants/${id}`, updateData);
    return data;
  } catch (error) {
    console.error(`Error updating tenant ${id}:`, error);
    throw error;
  }
};

export const getTenants = async () => {
  try {
    const { data } = await api.get('/tenants');
    return data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

export const createTenant = async (dto: {
  nombre: string;
  rfc: string;
  plan?: string;
  adminUser: { nombre: string; email: string; password: string };
}) => {
  try {
    const { data } = await api.post('/tenants', dto);
    return data;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
};
