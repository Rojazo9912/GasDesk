import api from './api';

export const getInvoiceByOrden = async (ordenId: string) => {
  const { data } = await api.get(`/invoices/orden/${ordenId}`);
  return data;
};

export const createInvoice = async (payload: {
  ordenId: string;
  folioFiscalUuid: string;
  rfcEmisor: string;
  fechaEmision: string;
  subtotal: number;
  iva: number;
  total: number;
  xmlUrl?: string;
  pdfUrl?: string;
}) => {
  const { data } = await api.post('/invoices', payload);
  return data;
};
