import { faker } from '@faker-js/faker';

export interface AgentData {
  name: string;
  email: string;
  phone: string;
  nid: string;
  password: string;
  newPassword: string;
}

/** Builds a unique Agent per run using Gmail plus-addressing on one real inbox. */
export function generateAgent(): AgentData {
  const stamp = Date.now().toString();
  const [user, domain] = (process.env.GMAIL_ADDRESS || 'yourname@gmail.com').split('@');
  return {
    name: `${faker.person.firstName()} Agent`,
    email: `${user}+playwright${stamp}@${domain}`,
    // 11-digit BD number: 017 + last 8 digits of the timestamp
    phone: `017${stamp.slice(-8)}`,
    nid: faker.string.numeric({ length: 10, allowLeadingZeros: false }),
    password: process.env.AGENT_PASSWORD || '1234',
    newPassword: process.env.AGENT_NEW_PASSWORD || '5678',
  };
}

/** "Tk 1,512.50" / "৳2000" / "2000.00" -> 1512.5 */
export function parseMoney(text: string): number {
  const cleaned = text.replace(/[^\d.-]/g, '');
  const value = Number(cleaned);
  if (cleaned === '' || Number.isNaN(value)) throw new Error(`Cannot parse amount from "${text}"`);
  return value;
}

/** Local date as YYYY-MM-DD (en-CA formats that way). */
export function todayStamp(): string {
  return new Date().toLocaleDateString('en-CA');
}
