import api from './api';

export const getProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

export const createProduct = async (payload: {
  nombre: string;
  unidad: string;
  categoria: string;
  stockMinimo?: number;
}) => {
  const { data } = await api.post('/products', payload);
  return data;
};

export const updateProduct = async (
  id: string,
  payload: Partial<{ nombre: string; unidad: string; categoria: string; stockMinimo: number }>,
) => {
  const { data } = await api.patch(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
