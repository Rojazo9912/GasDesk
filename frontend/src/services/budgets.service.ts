import api from './api';

export interface Budget {
  id: string;
  locationId: string;
  anio: number;
  mes: number;
  montoAsignado: number;
  montoEjercido: number;
  location?: { nombre: string };
}

export interface CreateBudgetPayload {
  locationId: string;
  anio: number;
  mes: number;
  montoAsignado: number;
}

const budgetsService = {
  getAll: (params?: { anio?: number; mes?: number; locationId?: string }) =>
    api.get<Budget[]>('/budgets', { params }).then(r => r.data),

  create: (data: CreateBudgetPayload) =>
    api.post<Budget>('/budgets', data).then(r => r.data),

  update: (id: string, montoAsignado: number) =>
    api.patch<Budget>(`/budgets/${id}`, { montoAsignado }).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/budgets/${id}`).then(r => r.data),
};

export default budgetsService;
