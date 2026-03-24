import api from './api';

export const getLocations = async () => {
  try {
    const { data } = await api.get('/locations');
    return data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const createLocation = async (locationData: any) => {
  try {
    const { data } = await api.post('/locations', locationData);
    return data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

export const updateLocation = async (id: string, updateData: any) => {
  try {
    const { data } = await api.patch(`/locations/${id}`, updateData);
    return data;
  } catch (error) {
    console.error(`Error updating location ${id}:`, error);
    throw error;
  }
};

export const deleteLocation = async (id: string) => {
  try {
    const { data } = await api.delete(`/locations/${id}`);
    return data;
  } catch (error) {
    console.error(`Error deleting location ${id}:`, error);
    throw error;
  }
};
