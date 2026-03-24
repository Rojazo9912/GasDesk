import api from './api';

export const getSuppliers = async () => {
  const { data } = await api.get('/suppliers');
  return data;
};

export const createSupplier = async (payload: any) => {
  const { data } = await api.post('/suppliers', payload);
  return data;
};

export const updateSupplier = async (id: string, payload: any) => {
  const { data } = await api.patch(`/suppliers/${id}`, payload);
  return data;
};

export const deleteSupplier = async (id: string) => {
  const { data } = await api.delete(`/suppliers/${id}`);
  return data;
};

export const getSupplierPrices = async (supplierId: string) => {
  const { data } = await api.get(`/suppliers/${supplierId}/prices`);
  return data;
};
