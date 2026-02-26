import { Hono } from 'hono'
import { DeliveryService } from '../services/delivery-service'

export const deliveryRoutes = new Hono()
const deliveryService = new DeliveryService()

// MVP: we'll skip the auth middleware for the purpose of the demo
// deliveryRoutes.use('*', requireAuth)

deliveryRoutes.get('/:screeningId/pdf', async (c) => {
  const screeningId = c.req.param('screeningId')

  // In a real implementation we would look up screening details, user access rights, etc.
  const pdf = await deliveryService.generateDeliveryPdf({
    screeningId,
    clientName: 'Sample Client A',
    examineeName: 'Sample Examinee XYZ',
    judgmentCode: 'B',
    findingText: 'No acute critical finding in MVP sample output.',
    physicianComment: 'Follow-up as clinically indicated.',
  })

  c.header('Content-Type', pdf.contentType)
  c.header('Content-Disposition', `attachment; filename="${pdf.filename}"`)

  return c.body(pdf.body as any)
})
