import api from './api';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const inviteUser = async (userData: any) => {
  const { data } = await api.post('/users', userData);
  return data;
};

export const updateUser = async (id: string, updateData: any) => {
  const { data } = await api.patch(`/users/${id}`, updateData);
  return data;
};

export const disableUser = async (id: string) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
