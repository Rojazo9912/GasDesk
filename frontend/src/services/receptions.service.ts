import api from './api';

export const getReceptionsByOrden = async (ordenId: string) => {
  const { data } = await api.get(`/receptions/orden/${ordenId}`);
  return data;
};

export const createReception = async (payload: {
  ordenId: string;
  facturaId?: string;
  notas?: string;
  items: { productId: string; cantidadRecibida: number; notas?: string }[];
}) => {
  const { data } = await api.post('/receptions', payload);
  return data;
};
