interface Env { BREVO_API_KEY: string; }

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

  const textBody = `Name: ${safeName}\nE-Mail: ${safeEmail}${phoneLine}${paketLine}\n\nNachricht:\n${safeMessage}`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Kontaktformular claveon.de', email: 'noreply@claveon.de' },
      to: [{ email: 'info@claveon.de', name: 'ClaveON' }],
      replyTo: { email: safeEmail, name: safeName },
      subject: `Neue Anfrage von ${safeName}${paket ? ` – ${paket}` : ''}`,
      textContent: textBody,
    }),
  });

  if (!res.ok)
    return new Response(JSON.stringify({ error: 'Sendefehler' }), { status: 500, headers });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
