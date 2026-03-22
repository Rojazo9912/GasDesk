import api from './api';

export const getPurchaseRequests = async () => {
  const { data } = await api.get('/purchase-requests');
  return data;
};

export const getPurchaseRequestById = async (id: string) => {
  const { data } = await api.get(`/purchase-requests/${id}`);
  return data;
};

export const createPurchaseRequest = async (payload: any) => {
  const { data } = await api.post('/purchase-requests', payload);
  return data;
};

export const approveRequest = async (id: string, comentario: string) => {
  const { data } = await api.post(`/purchase-requests/${id}/approve`, { comentario });
  return data;
};

export const rejectRequest = async (id: string, comentario: string) => {
  const { data } = await api.post(`/purchase-requests/${id}/reject`, { comentario });
  return data;
};

export const markRequestAsCompleted = async (id: string) => {
  const { data } = await api.post(`/purchase-requests/${id}/complete`);
  return data;
};
