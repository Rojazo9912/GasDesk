import api from './api';

export const getDashboardStats = async () => {
  const { data } = await api.get('/reports/dashboard');
  return data;
};

export const getGastosPorProveedor = async (desde?: string, hasta?: string) => {
  const { data } = await api.get('/reports/gastos-proveedor', { params: { desde, hasta } });
  return data;
};

export const getSCPorEstatus = async () => {
  const { data } = await api.get('/reports/sc-por-estatus');
  return data;
};

export const getOCRecientes = async () => {
  const { data } = await api.get('/reports/oc-recientes');
  return data;
};

export const getSpendingTrend = async () => {
  const { data } = await api.get('/reports/trend');
  return data;
};

export const getTopSuppliers = async () => {
  const { data } = await api.get('/reports/top-suppliers');
  return data;
};

export const getApprovalTime = async () => {
  const { data } = await api.get('/reports/approval-time');
  return data;
};
