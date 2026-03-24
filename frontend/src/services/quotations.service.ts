import api from './api';

export interface QuotationItem {
  id: string;
  productId: string;
  cantidadSolicitada: number;
  precioUnitario?: number;
  importe?: number;
  product?: { nombre: string; unidad: string };
}

export interface Quotation {
  id: string;
  solicitudId: string;
  supplierId: string;
  estatus: 'PENDIENTE' | 'RESPONDIDA' | 'SELECCIONADA' | 'VENCIDA' | 'CANCELADA';
  validezDias: number;
  notas?: string;
  creadoEn: string;
  supplier?: { nombre: string; contactoEmail?: string };
  items: QuotationItem[];
}

export interface CreateQuotationPayload {
  solicitudId: string;
  supplierId: string;
  validezDias?: number;
  notas?: string;
  items: { productId: string; cantidadSolicitada: number; precioUnitario?: number }[];
}

export interface UpdateQuotationPayload {
  notas?: string;
  items: { productId: string; precioUnitario: number }[];
}

const quotationsService = {
  create: (data: CreateQuotationPayload) =>
    api.post<Quotation>('/quotations', data).then(r => r.data),

  getBySolicitud: (solicitudId: string) =>
    api.get<Quotation[]>(`/quotations/solicitud/${solicitudId}`).then(r => r.data),

  getAll: () =>
    api.get<Quotation[]>('/quotations').then(r => r.data),

  update: (id: string, data: UpdateQuotationPayload) =>
    api.patch<Quotation>(`/quotations/${id}`, data).then(r => r.data),

  select: (id: string) =>
    api.patch<Quotation>(`/quotations/${id}/select`, {}).then(r => r.data),

  cancel: (id: string) =>
    api.delete(`/quotations/${id}`).then(r => r.data),
};

export default quotationsService;
