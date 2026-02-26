import { PdfService } from '../lib/pdf'

export class DeliveryService {
  constructor(private readonly pdfService = new PdfService()) { }

  async generateDeliveryPdf(input: {
    screeningId: string
    clientName: string
    examineeName: string
    judgmentCode: string
    findingText: string
    physicianComment?: string | null
  }) {
    const pdfBuffer = await this.pdfService.renderDeliveryPdf(input)

    return {
      filename: `reading-result-${input.screeningId}.pdf`,
      contentType: 'application/pdf',
      sizeBytes: pdfBuffer.byteLength,
      body: pdfBuffer,
    }
  }
}
