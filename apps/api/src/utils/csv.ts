export type CsvRow = Record<string, string>

function unquote(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"')
  }
  return trimmed
}

export function parseCsv(input: string): CsvRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(unquote)

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map(unquote)
    const row: CsvRow = {}
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? ''
    })
    return row
  })
}
