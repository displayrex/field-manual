// Vercel Routing Middleware: password-protects every path with HTTP Basic Auth.
// Set FM_USER and FM_PASS in Vercel → Project → Settings → Environment Variables
// (for Production AND Preview). If either is missing the site fails closed (503).
export const config = { matcher: '/:path*' };

const enc = new TextEncoder();

// Constant-time comparison so response timing doesn't reveal how much of a guess matched.
function safeEqual(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function decodeBasic(header) {
  const m = /^Basic\s+([A-Za-z0-9+/=]+)$/.exec(header || '');
  if (!m) return null;
  try {
    const bytes = Uint8Array.from(atob(m[1]), c => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes); // UTF-8 safe
    const i = text.indexOf(':');
    return i < 0 ? null : { user: text.slice(0, i), pass: text.slice(i + 1) };
  } catch {
    return null;
  }
}

const deny = () => new Response('Authentication required', {
  status: 401,
  headers: {
    'WWW-Authenticate': 'Basic realm="Field Manual", charset="UTF-8"',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  },
});

export default function middleware(request) {
  const user = process.env.FM_USER;
  const pass = process.env.FM_PASS;
  if (!user || !pass) {
    return new Response('Field Manual is locked: set FM_USER and FM_PASS in Vercel, then redeploy.', {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
  const creds = decodeBasic(request.headers.get('authorization'));
  // Evaluate both comparisons every time (no short-circuit on the username).
  const ok = creds ? (safeEqual(creds.user, user) & safeEqual(creds.pass, pass)) : 0;
  if (ok) return; // authorized: continue to the static files
  return deny();
}
