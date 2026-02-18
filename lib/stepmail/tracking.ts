export interface TrackingPayload {
  sub: string;   // subscriber_id
  cid: string;   // content_id
  sid?: string;  // sequence_id
  nid?: string;  // node_id
  evt: 'o' | 'c'; // 'o' = open, 'c' = click
  exp: number;   // expiry unix timestamp
}

const SECRET = process.env.TRACKING_SECRET || 'stepmail-tracking-secret-change-me';

function base64url(data: ArrayBuffer | Uint8Array): string {
  return Buffer.from(new Uint8Array(data)).toString('base64url');
}

export async function signTrackingToken(payload: Omit<TrackingPayload, 'exp'>): Promise<string> {
  const fullPayload: TrackingPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 days
  };

  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(Buffer.from(JSON.stringify(fullPayload)));
  const signingInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    Buffer.from(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, Buffer.from(signingInput));

  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

export async function verifyTrackingToken(token: string): Promise<TrackingPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const signingInput = `${header}.${body}`;
    const key = await crypto.subtle.importKey(
      'raw',
      Buffer.from(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      Buffer.from(sig, 'base64url'),
      Buffer.from(signingInput)
    );

    if (!isValid) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TrackingPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
