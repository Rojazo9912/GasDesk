import api from './api';

export const getDeptStock = async (departmentId?: string) => {
  const { data } = await api.get('/department-inventory', {
    params: departmentId ? { departmentId } : {},
  });
  return data;
};

export const getDeptMovements = async (departmentId?: string, productId?: string) => {
  const { data } = await api.get('/department-inventory/movements', {
    params: { ...(departmentId ? { departmentId } : {}), ...(productId ? { productId } : {}) },
  });
  return data;
};

export const adjustDeptInventory = async (dto: {
  departmentId: string;
  productId: string;
  cantidad: number;
  notas?: string;
}) => {
  const { data } = await api.post('/department-inventory/adjust', dto);
  return data;
};
