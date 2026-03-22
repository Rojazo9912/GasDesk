import api from './api';

export const getLocations = async () => {
  const { data } = await api.get('/locations');
  return data;
};

export const createLocation = async (locationData: any) => {
  const { data } = await api.post('/locations', locationData);
  return data;
};

export const updateLocation = async (id: string, updateData: any) => {
  const { data } = await api.patch(`/locations/${id}`, updateData);
  return data;
};

export const deleteLocation = async (id: string) => {
  const { data } = await api.delete(`/locations/${id}`);
  return data;
};
