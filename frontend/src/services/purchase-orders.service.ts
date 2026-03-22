import api from './api';

export const getPurchaseOrders = async () => {
  const { data } = await api.get('/purchase-orders');
  return data;
};

export const getPurchaseOrderById = async (id: string) => {
  const { data } = await api.get(`/purchase-orders/${id}`);
  return data;
};

export const createPurchaseOrder = async (payload: any) => {
  const { data } = await api.post('/purchase-orders', payload);
  return data;
};

export const sendPurchaseOrderEmail = async (id: string, pdfUrl: string) => {
  const { data } = await api.post(`/purchase-orders/${id}/send`, { pdfUrl });
  return data;
};
