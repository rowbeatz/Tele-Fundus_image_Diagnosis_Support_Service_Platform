import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { BillingService } from '../services/billing-service'
import { InvoiceRepository } from '../repositories/invoice-repository'
import { PhysicianPaymentRepository } from '../repositories/physician-payment-repository'
import { BillingPlanRepository } from '../repositories/billing-plan-repository'
import { PhysicianPayoutTierRepository } from '../repositories/physician-payout-tier-repository'

export const accountingRoutes = new Hono()
  .use('*', requireAuth)

  // System-wide Financial Dashboard
  .get('/dashboard', async (ctx) => {
    const db = getDb()
    
    // Quick summary of total billed, total paid, and gross margin for a given month or overall
    const generatedInvoices = await db.query<{ totalBilled: number }>(`select coalesce(sum(base_amount), 0) as "totalBilled" from invoices`)
    const generatedPayments = await db.query<{ totalPaid: number }>(`select coalesce(sum(base_amount), 0) as "totalPaid" from physician_payments`)
    
    const totalBilled = Number(generatedInvoices.rows[0].totalBilled)
    const totalPaid = Number(generatedPayments.rows[0].totalPaid)
    const grossMargin = totalBilled - totalPaid
    const grossMarginPercent = totalBilled > 0 ? (grossMargin / totalBilled) * 100 : 0

    return ctx.json({
      totalBilled,
      totalPaid,
      grossMargin,
      grossMarginPercent: Number(grossMarginPercent.toFixed(2)),
    })
  })

  // Create/Update Billing Plan for an Organization
  .post(
    '/plans',
    zValidator(
      'json',
      z.object({
        organizationId: z.string().optional(), // Null for global default
        name: z.string(),
        basePrice: z.number(),
        volumeTiersJson: z.string().optional() // JSON array string
      })
    ),
    async (ctx) => {
      const data = ctx.req.valid('json')
      const db = getDb()
      const planRepo = new BillingPlanRepository(db)
      
      const plan = await planRepo.create({
        ...data,
        isActive: true
      })
      
      return ctx.json({ success: true, plan })
    }
  )

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
      const billingPlanRepo = new BillingPlanRepository(db)
      const payoutTierRepo = new PhysicianPayoutTierRepository(db)
      const billingService = new BillingService(db, invoiceRepo, paymentRepo, billingPlanRepo, payoutTierRepo)

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
      const billingPlanRepo = new BillingPlanRepository(db)
      const payoutTierRepo = new PhysicianPayoutTierRepository(db)
      const billingService = new BillingService(db, invoiceRepo, paymentRepo, billingPlanRepo, payoutTierRepo)

      const count = await billingService.calculatePhysicianPayments(paymentMonth)

      return ctx.json({ success: true, count, message: `Generated ${count} payments.` })
    }
  )

