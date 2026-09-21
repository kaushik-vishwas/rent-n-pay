import crypto from 'crypto';
import Admin from '../models/Admin.js';

export function slugifyCityName(city) {
  const slug = String(city || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'city';
}

export function cityAdminUsernameFromName(city) {
  return `rnpadm-${slugifyCityName(city)}`;
}

export function compactCitySlug(city) {
  const slug = slugifyCityName(city).replace(/-/g, '');
  return slug || 'city';
}

export function cityAdminPasswordFromName(city) {
  return `rnp@${compactCitySlug(city)}123`;
}

export async function uniqueCityAdminUsername(city) {
  const base = cityAdminUsernameFromName(city);
  let candidate = base;
  let n = 2;
  while (await Admin.findOne({ email: candidate })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export function generateStrongPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;
  const pick = (set) => set[crypto.randomInt(0, set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
