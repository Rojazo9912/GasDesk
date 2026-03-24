import api from './api';

export const getPurchaseOrders = async () => {
  try {
    const { data } = await api.get('/purchase-orders');
    return data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

export const getPurchaseOrderById = async (id: string) => {
  try {
    const { data } = await api.get(`/purchase-orders/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching purchase order ${id}:`, error);
    throw error;
  }
};

export const createPurchaseOrder = async (payload: any) => { // TODO: Add CreatePurchaseOrderDto type
  try {
    const { data } = await api.post('/purchase-orders', payload);
    return data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

export const sendPurchaseOrderEmail = async (id: string) => {
  try {
    // pdfUrl removed for security. Backend must resolve it internally
    const { data } = await api.post(`/purchase-orders/${id}/send`);
    return data;
  } catch (error) {
    console.error(`Error sending email for PO ${id}:`, error);
    throw error;
  }
};
