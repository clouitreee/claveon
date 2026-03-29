interface Env { BREVO_API_KEY: string; SIMPLELOGIN_API_KEY?: string; NOTIFICATION_EMAIL: string; }

type SLAlias = { id: number; email: string };
type SLContact = { reverse_alias_address?: string };

async function getSimpleLoginReverseAlias(
  apiKey: string,
  clientName: string,
  clientEmail: string
): Promise<string | null> {
  try {
    const aliasRes = await fetch(
      'https://app.simplelogin.io/api/v2/aliases?page_id=0&query=info%40claveon.de',
      { headers: { 'Authentication': apiKey } }
    );
    if (!aliasRes.ok) return null;

    const { aliases } = await aliasRes.json() as { aliases: SLAlias[] };
    const alias = aliases.find(a => a.email === 'info@claveon.de');
    if (!alias) return null;

    const contactRes = await fetch(
      `https://app.simplelogin.io/api/aliases/${alias.id}/contacts`,
      {
        method: 'POST',
        headers: {
          'Authentication': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact: `${clientName} <${clientEmail}>` }),
      }
    );
    if (!contactRes.ok) return null;

    const contact = await contactRes.json() as SLContact;
    return contact.reverse_alias_address ?? null;
  } catch {
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };

  let body: { name?: string; email?: string; phone?: string; paket?: string; message?: string };
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers }); }

  const { name, email, phone, paket, message } = body;

  if (!name || !email || !message)
    return new Response(JSON.stringify({ error: 'Fehlende Felder' }), { status: 400, headers });

  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100)
    return new Response(JSON.stringify({ error: 'Name ungültig (2–100 Zeichen)' }), { status: 400, headers });

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return new Response(JSON.stringify({ error: 'E-Mail ungültig' }), { status: 400, headers });

  if (phone && (typeof phone !== 'string' || phone.length > 30))
    return new Response(JSON.stringify({ error: 'Telefon ungültig' }), { status: 400, headers });

  const validPakete = ['', 'remote', 'onsite', 'neustart', 'migration', 'other'];
  if (paket && !validPakete.includes(paket))
    return new Response(JSON.stringify({ error: 'Paket ungültig' }), { status: 400, headers });

  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 2000)
    return new Response(JSON.stringify({ error: 'Nachricht: 10–2000 Zeichen' }), { status: 400, headers });

  const safeName    = name.trim().slice(0, 100);
  const safeEmail   = email.trim().slice(0, 254);
  const safePhone   = phone ? phone.trim().slice(0, 30) : '';
  const safeMessage = message.trim().slice(0, 2000);

  const phoneLine = safePhone ? `\nTelefon: ${safePhone}` : '';
  const paketLine = paket     ? `\nPaket: ${paket}`       : '';

  // Get SimpleLogin reverse alias so replies go FROM info@claveon.de
  const reverseAlias = env.SIMPLELOGIN_API_KEY
    ? await getSimpleLoginReverseAlias(env.SIMPLELOGIN_API_KEY, safeName, safeEmail)
    : null;

  const replyEmail = reverseAlias ?? safeEmail;

  const textBody = `Name: ${safeName}\nE-Mail: ${safeEmail}${phoneLine}${paketLine}\n\nNachricht:\n${safeMessage}`;

  const paketLabel: Record<string, string> = {
    remote: 'Fernwartung · €29 / 30 Min',
    onsite: 'Vor-Ort Hilfe · €79',
    neustart: 'Neustart-Paket · €89',
    migration: 'Windows 10 → 11 · €99',
    other: 'Sonstiges · €59/h',
  };

  const paketRow = paket ? `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;vertical-align:top;">Paket</td>
      <td style="padding:8px 0;font-size:14px;font-weight:600;color:#C1440E;">${paketLabel[paket] ?? paket}</td>
    </tr>` : '';

  const phoneRow = safePhone ? `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;">Telefon</td>
      <td style="padding:8px 0;font-size:14px;">${safePhone}</td>
    </tr>` : '';

  const htmlBody = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#C1440E;padding:24px 32px;">
            <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ClaveON</span>
            <span style="font-size:13px;color:rgba(255,255,255,0.75);margin-left:12px;">Neue Anfrage</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111827;">
              ${safeName}${paket ? ` <span style="font-size:14px;font-weight:400;color:#C1440E;background:#FDF0EB;padding:3px 10px;border-radius:20px;margin-left:8px;">${paketLabel[paket] ?? paket}</span>` : ''}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;">E-Mail</td>
                <td style="padding:8px 0;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#C1440E;text-decoration:none;">${safeEmail}</a></td>
              </tr>
              ${phoneRow}
              ${paketRow}
            </table>
            <div style="margin-top:24px;padding:20px;background:#f9fafb;border-left:3px solid #C1440E;border-radius:0 6px 6px 0;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Nachricht</p>
              <p style="margin:0;font-size:15px;color:#1f2937;white-space:pre-wrap;line-height:1.6;">${safeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <div style="margin-top:28px;text-align:center;">
              <a href="https://claveon.de/claveon/reply?to=${encodeURIComponent(replyEmail)}&name=${encodeURIComponent(safeName)}&subject=${encodeURIComponent('Re: Ihre Anfrage bei ClaveON')}&msg=${encodeURIComponent(safeMessage)}"
                 style="display:inline-block;background:#C1440E;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:600;">
                Antworten an ${safeName}
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">claveon.de · info@claveon.de</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Kontaktformular claveon.de', email: 'noreply@claveon.de' },
      to: [{ email: env.NOTIFICATION_EMAIL, name: 'ClaveON' }],
      replyTo: { email: replyEmail, name: safeName },
      subject: `Neue Anfrage von ${safeName}${paket ? ` – ${paket}` : ''}`,
      htmlContent: htmlBody,
      textContent: textBody,
    }),
  });

  if (!res.ok)
    return new Response(JSON.stringify({ error: 'Sendefehler' }), { status: 500, headers });

  // Auto-confirmation to client
  const confirmHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#C1440E;padding:24px 32px;">
            <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ClaveON</span>
            <span style="font-size:13px;color:rgba(255,255,255,0.75);margin-left:12px;">Ihre Anfrage</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Vielen Dank, ${safeName}!</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">Wir haben Ihre Anfrage erhalten und melden uns <strong>innerhalb von 24 Stunden</strong> bei Ihnen.</p>
            <div style="padding:20px;background:#f9fafb;border-left:3px solid #C1440E;border-radius:0 6px 6px 0;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Ihre Nachricht</p>
              <p style="margin:0;font-size:14px;color:#1f2937;white-space:pre-wrap;line-height:1.6;">${safeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">claveon.de · Technische Hilfe in Köln</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'ClaveON', email: 'info@claveon.de' },
      to: [{ email: safeEmail, name: safeName }],
      replyTo: { email: 'info@claveon.de', name: 'ClaveON' },
      subject: `Ihre Anfrage bei ClaveON — wir melden uns bald`,
      htmlContent: confirmHtml,
      textContent: `Vielen Dank, ${safeName}!\n\nWir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.\n\nIhre Nachricht:\n${safeMessage}\n\n--\nclaveon.de · info@claveon.de`,
    }),
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
