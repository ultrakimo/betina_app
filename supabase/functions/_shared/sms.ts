// Shared SMS sender with automatic failover: try SMSEagle first, fall back to
// Brevo if it's unavailable or errors. Best-effort — never throws.
//
// Env: SMSEAGLE_URL, SMSEAGLE_TOKEN, BREVO_API_KEY, BREVO_SENDER (optional).

const SMSEAGLE_URL   = Deno.env.get('SMSEAGLE_URL') ?? '';
const SMSEAGLE_TOKEN = Deno.env.get('SMSEAGLE_TOKEN') ?? '';
const BREVO_API_KEY  = Deno.env.get('BREVO_API_KEY') ?? '';
const BREVO_SENDER   = Deno.env.get('BREVO_SENDER') ?? 'BETina';

async function viaSmsEagle(phone: string, text: string): Promise<boolean> {
  if (!SMSEAGLE_URL || !SMSEAGLE_TOKEN) return false;
  try {
    const r = await fetch(SMSEAGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SMSEAGLE_TOKEN}` },
      body: JSON.stringify({ to: [phone], text }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function viaBrevo(phone: string, text: string): Promise<boolean> {
  if (!BREVO_API_KEY) return false;
  try {
    const r = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ sender: BREVO_SENDER, recipient: phone, content: text, type: 'transactional' }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Best-effort SMS with SMSEagle → Brevo failover. Returns the gateway used, or 'none'. */
export async function sendSms(phone: string, body: string): Promise<'smseagle' | 'brevo' | 'none'> {
  const text = body.length > 155 ? body.slice(0, 152) + '...' : body; // ~160 char SMS limit
  if (await viaSmsEagle(phone, text)) return 'smseagle';
  if (await viaBrevo(phone, text)) return 'brevo';
  return 'none';
}
