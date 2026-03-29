interface Env { BREVO_API_KEY: string; REPLY_PASSWORD: string; NOTIFICATION_EMAIL: string; }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };

  let body: { password?: string; to?: string; name?: string; subject?: string; message?: string };
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers }); }

  if (body.password !== env.REPLY_PASSWORD)
    return new Response(JSON.stringify({ error: 'Falsches Passwort' }), { status: 401, headers });

  const { to, name, subject, message } = body;

  if (!to || !name || !message)
    return new Response(JSON.stringify({ error: 'Fehlende Felder' }), { status: 400, headers });

  if (typeof message !== 'string' || message.trim().length < 5 || message.length > 5000)
    return new Response(JSON.stringify({ error: 'Nachricht ungültig' }), { status: 400, headers });

  const safeMessage = message.trim();
  const safeName    = (name as string).slice(0, 100);
  const safeSubject = subject ? (subject as string).slice(0, 200) : `Ihre Anfrage bei ClaveON`;

  const htmlBody = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@700&display=swap');</style></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr>
          <td bgcolor="#C1440E" style="background:#C1440E;padding:24px 32px;">
            <span style="font-family:'IBM Plex Mono','Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:-0.5px;"><span style="color:#ffffff;">Clave</span><span style="color:#fde8df;">ON</span></span>
            <span style="font-size:13px;color:rgba(255,255,255,0.75);margin-left:12px;">Ihre Anfrage</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">Guten Tag ${safeName},</p>
            <div style="font-size:15px;color:#1f2937;line-height:1.7;white-space:pre-wrap;">${safeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">Mit freundlichen Grüßen<br><strong style="color:#C1440E;">ClaveON</strong> · Technische Hilfe in Köln</p>
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
      sender: { name: 'ClaveON', email: 'noreply@claveon.de' },
      to: [{ email: to, name: safeName }],
      bcc: [{ email: env.NOTIFICATION_EMAIL }],
      replyTo: { email: 'info@claveon.de', name: 'ClaveON' },
      subject: safeSubject,
      htmlContent: htmlBody,
      textContent: `Guten Tag ${safeName},\n\n${safeMessage}\n\n--\nMit freundlichen Grüßen\nClaveON · claveon.de`,
    }),
  });

  if (!res.ok)
    return new Response(JSON.stringify({ error: 'Sendefehler' }), { status: 500, headers });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
