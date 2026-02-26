export type MailPayload = {
  to: string
  subject: string
  text: string
}

export interface Mailer {
  send(payload: MailPayload): Promise<void>
}

export class ConsoleMailer implements Mailer {
  async send(payload: MailPayload): Promise<void> {
    // 本番では SES / SendGrid などに差し替える
    console.log('[MAIL]', JSON.stringify(payload))
  }
}
