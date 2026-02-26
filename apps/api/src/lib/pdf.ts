import puppeteer from 'puppeteer'

export type DeliveryTemplateInput = {
  screeningId: string
  clientName: string
  examineeName: string
  judgmentCode: string
  findingText: string
  physicianComment?: string | null
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function renderDeliveryHtml(input: DeliveryTemplateInput) {
  return `
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>Reading Result</title>
  <style>
    body { font-family: sans-serif; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    td, th { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
    .section { margin-top: 16px; }
  </style>
</head>
<body>
  <h1>眼底画像読影結果</h1>
  <table>
    <tr><th>案件ID</th><td>${escapeHtml(input.screeningId)}</td></tr>
    <tr><th>依頼元</th><td>${escapeHtml(input.clientName)}</td></tr>
    <tr><th>受診者</th><td>${escapeHtml(input.examineeName)}</td></tr>
    <tr><th>判定</th><td>${escapeHtml(input.judgmentCode)}</td></tr>
  </table>
  <div class="section">
    <strong>所見</strong>
    <div>${escapeHtml(input.findingText).replaceAll('\n', '<br />')}</div>
  </div>
  <div class="section">
    <strong>コメント</strong>
    <div>${escapeHtml(input.physicianComment ?? '').replaceAll('\n', '<br />')}</div>
  </div>
</body>
</html>
`
}

export class PdfService {
  async renderDeliveryPdf(input: DeliveryTemplateInput) {
    const html = renderDeliveryHtml(input)
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4' })
    await browser.close()
    return pdfBuffer
  }
}
