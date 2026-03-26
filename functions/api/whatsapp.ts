interface Env { WHATSAPP_NUMBER: string; }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const number = env.WHATSAPP_NUMBER;
  if (!number) return new Response('Not configured', { status: 404 });
  return Response.redirect(`https://wa.me/${number}`, 302);
};
