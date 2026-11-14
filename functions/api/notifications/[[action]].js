export async function onRequest({ request, env }) {
  if (!env.REMINDERS) {
    return Response.json({ configured: false }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  return env.REMINDERS.fetch(request);
}
