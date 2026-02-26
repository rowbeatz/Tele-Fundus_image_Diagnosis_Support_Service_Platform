import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { BillingService } from '../services/billing-service'
import { InvoiceRepository } from '../repositories/invoice-repository'
import { PhysicianPaymentRepository } from '../repositories/physician-payment-repository'

export const accountingRoutes = new Hono()
  .use('*', requireAuth)

  // Generate Invoices for a specific month
  .post(
    '/invoices/generate',
    zValidator(
      'json',
      z.object({
        billingMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM format'),
      })
    ),
    async (ctx) => {
      const { billingMonth } = ctx.req.valid('json')
      
      const db = getDb()
      const invoiceRepo = new InvoiceRepository(db)
      const paymentRepo = new PhysicianPaymentRepository(db)
      const billingService = new BillingService(db, invoiceRepo, paymentRepo)

      const count = await billingService.calculateClientInvoices(billingMonth)

      return ctx.json({ success: true, count, message: `Generated ${count} invoices.` })
    }
  )

  // Generate Payments for a specific month
  .post(
    '/payments/generate',
    zValidator(
      'json',
      z.object({
        paymentMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM format'),
      })
    ),
    async (ctx) => {
      const { paymentMonth } = ctx.req.valid('json')
      
      const db = getDb()
      const invoiceRepo = new InvoiceRepository(db)
      const paymentRepo = new PhysicianPaymentRepository(db)
      const billingService = new BillingService(db, invoiceRepo, paymentRepo)

      const count = await billingService.calculatePhysicianPayments(paymentMonth)

      return ctx.json({ success: true, count, message: `Generated ${count} payments.` })
    }
  )
