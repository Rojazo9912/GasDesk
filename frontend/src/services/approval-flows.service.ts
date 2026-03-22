import api from './api';

export const getApprovalFlows = async () => {
  const { data } = await api.get('/approval-flows');
  return data;
};

export const createApprovalFlow = async (flowData: any) => {
  const { data } = await api.post('/approval-flows', flowData);
  return data;
};

export const reorderApprovalFlows = async (flowIds: string[]) => {
  const { data } = await api.patch('/approval-flows/reorder', { flowIds });
  return data;
};

export const deleteApprovalFlow = async (id: string) => {
  const { data } = await api.delete(`/approval-flows/${id}`);
  return data;
};
