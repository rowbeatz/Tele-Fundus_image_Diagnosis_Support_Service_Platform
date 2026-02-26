import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tfp'

export const pool = new Pool({
  connectionString,
  max: 10,
})

export async function query<T = unknown>(sql: string, params?: unknown[]) {
  return pool.query<T>(sql, params)
}

export interface DbLike {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
}
