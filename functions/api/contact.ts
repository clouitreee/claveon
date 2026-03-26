interface Env { RESEND_API_KEY: string; }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };

  let body: { name?: string; email?: string; phone?: string; paket?: string; message?: string };
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers }); }

  const { name, email, phone, paket, message } = body;
  if (!name || !email || !message)
    return new Response(JSON.stringify({ error: 'Fehlende Felder' }), { status: 400, headers });

  const phoneLine = phone ? `\nTelefon: ${phone}` : '';
  const paketLine = paket ? `\nPaket: ${paket}` : '';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Kontaktformular claveon.de <noreply@send.claveon.de>',
      to: ['info@claveon.de'],
      reply_to: email,
      subject: `Neue Anfrage von ${name}${paket ? ` – ${paket}` : ''}`,
      text: `Name: ${name}\nE-Mail: ${email}${phoneLine}${paketLine}\n\nNachricht:\n${message}`,
    }),
  });

  if (!res.ok)
    return new Response(JSON.stringify({ error: 'Sendefehler' }), { status: 500, headers });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
