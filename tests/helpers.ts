import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';

// Real SQLite executes the production SQL. Only the D1 transport is adapted.
export function database(afterFirst?: (sql:string) => Promise<void>) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const name of readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`drizzle/${name}`, 'utf8'));
  const prepare = (sql: string) => {
    let args: any[] = [];
    return {
      bind(...values: any[]) { args = values; return this; },
      async first() { const row = sqlite.prepare(sql).get(...args) ?? null; if(afterFirst) await afterFirst(sql); return row; },
      async all() { return { results: sqlite.prepare(sql).all(...args) }; },
      async run() { const result = sqlite.prepare(sql).run(...args); return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }; },
    };
  };
  return { prepare, async batch(statements: any[]) { sqlite.exec('BEGIN'); try { const result = []; for (const s of statements) result.push(await s.run()); sqlite.exec('COMMIT'); return result; } catch(e) { sqlite.exec('ROLLBACK'); throw e; } } };
}
export function request(path: string, identity?: string, body?: unknown, method = body === undefined ? 'GET' : 'POST', email?: string) {
  const headers: Record<string,string> = {};
  if (identity) { headers['oai-authenticated-user-id'] = identity; headers['oai-authenticated-user-email'] = email || `${identity}@example.test`; }
  if (body !== undefined) { headers['content-type'] = 'application/json'; headers.origin = 'https://lingomitra.test'; }
  return new Request(`https://lingomitra.test${path}`, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
