// Phone normalization — MUST be identical to the CRM (Python) + the profiles
// SQL trigger, or app-user ↔ CRM-player matching breaks.
//
// Rules (agreed with CRM side):
//   • strip spaces / dashes / parentheses
//   • leading "00" international prefix → "+"
//   • never guess a country code
//   • result is always "+" followed by the digits

export function normalizePhone(raw: string): string {
  if (!raw) return raw;
  let phone = raw.replace(/[\s\-()]/g, '');
  if (phone.startsWith('00')) phone = '+' + phone.slice(2);
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length >= 10 && !phone.startsWith('+')) return '+' + digits;
  return phone.startsWith('+') ? '+' + digits : '+' + digits;
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}
