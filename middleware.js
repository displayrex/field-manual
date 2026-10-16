// Vercel Routing Middleware: password-protects the whole site with HTTP Basic Auth.
// Set FM_USER and FM_PASS in Vercel → Project → Settings → Environment Variables.
// If they're not set, the site refuses all requests rather than going public.
export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const user = process.env.FM_USER;
  const pass = process.env.FM_PASS;
  if (!user || !pass) {
    return new Response('Field Manual is locked: set FM_USER and FM_PASS in Vercel, then redeploy.', { status: 503 });
  }
  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = atob(encoded);
    const i = decoded.indexOf(':');
    if (i > -1 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
      return; // authorized: continue to the static files
    }
  }
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Field Manual", charset="UTF-8"' },
  });
}
