import fs from 'fs';
import path from 'path';
import { todayStamp } from './dataGenerator';

const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** Writes headers + rows to output/self_statement_<YYYY-MM-DD>.csv and returns the file path. */
export function writeSelfStatementCsv(headers: string[], rows: string[][]): string {
  const dir = path.resolve(__dirname, '..', 'output');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `self_statement_${todayStamp()}.csv`);
  const lines = [headers, ...rows].map((r) => r.map(escape).join(','));
  fs.writeFileSync(file, lines.join('\r\n') + '\r\n', 'utf-8');
  return file;
}

/** Minimal parser for the quoted CSV produced above. */
export function readCsv(file: string): string[][] {
  return fs
    .readFileSync(file, 'utf-8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((m) => m[1].replace(/""/g, '"')));
}
