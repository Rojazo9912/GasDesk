import api from './api';

export const getStock = async (locationId?: string) => {
  const { data } = await api.get('/inventory', { params: locationId ? { locationId } : {} });
  return data;
};

export const getMovements = async (locationId?: string, productId?: string) => {
  const params: Record<string, string> = {};
  if (locationId) params.locationId = locationId;
  if (productId) params.productId = productId;
  const { data } = await api.get('/inventory/movements', { params });
  return data;
};

export const adjustInventory = async (payload: {
  productId: string;
  locationId: string;
  cantidad: number;
  notas?: string;
}) => {
  const { data } = await api.post('/inventory/adjust', payload);
  return data;
};
