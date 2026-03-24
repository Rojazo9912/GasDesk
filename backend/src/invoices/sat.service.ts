import { Injectable } from '@nestjs/common';
import axios from 'axios';

/**
 * Verifica un CFDI contra el webservice público del SAT.
 * Endpoint: https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx
 * Protocolo: SOAP 1.1
 */
@Injectable()
export class SatService {
  private readonly url =
    'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx';

  async verificarCFDI(
    uuid: string,
    rfcEmisor: string,
    rfcReceptor: string,
    total: string,
  ): Promise<{ valido: boolean; estado?: string; error?: string }> {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Consulta xmlns="http://tempuri.org/">
      <expresionImpresa>?re=${encodeURIComponent(rfcEmisor)}&amp;rr=${encodeURIComponent(rfcReceptor)}&amp;tt=${encodeURIComponent(total)}&amp;id=${encodeURIComponent(uuid)}</expresionImpresa>
    </Consulta>
  </soap:Body>
</soap:Envelope>`;

    try {
      const response = await axios.post(this.url, soapBody, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'http://tempuri.org/IConsultaCFDIService/Consulta',
        },
        timeout: 8000,
      });

      const xml: string = response.data as string;
      // El SAT responde con CodigoEstatus y Estado dentro del XML
      const estadoMatch = xml.match(/<Estado>([^<]+)<\/Estado>/);
      const codigoMatch = xml.match(/<CodigoEstatus>([^<]+)<\/CodigoEstatus>/);

      const estado = estadoMatch?.[1] ?? '';
      const codigo = codigoMatch?.[1] ?? '';

      // "S - Comprobante obtenido satisfactoriamente" → válido y vigente
      const valido = codigo.startsWith('S -') && estado === 'Vigente';

      return { valido, estado: `${codigo} / ${estado}` };
    } catch (err: any) {
      console.error('[SAT] Error verificando CFDI:', err.message);
      return { valido: false, error: err.message };
    }
  }
}
