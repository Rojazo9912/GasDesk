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
