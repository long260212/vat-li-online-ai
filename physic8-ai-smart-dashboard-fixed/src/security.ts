const HASH_PREFIX = 'sha256:';

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fallbackHash(text: string): string {
  // Demo-only fallback for older/non-secure browser contexts where Web Crypto is unavailable.
  // It avoids storing a plain password but must not be treated as strong server-side security.
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return `demo:${Math.abs(hash).toString(36)}`;
}

export async function hashPassword(password: string): Promise<string> {
  const normalized = password.trim();
  if (!normalized) return '';

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(normalized);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return `${HASH_PREFIX}${toHex(digest)}`;
  }

  return fallbackHash(normalized);
}

export async function verifyPassword(inputPassword: string, storedPasswordHash?: string): Promise<boolean> {
  const input = inputPassword.trim();
  const stored = storedPasswordHash?.trim() || '';
  if (!input || !stored) return false;

  if (stored.startsWith(HASH_PREFIX)) {
    return (await hashPassword(input)) === stored;
  }

  if (stored.startsWith('demo:')) {
    return fallbackHash(input) === stored;
  }

  // Backward compatibility for old homework records that stored plain text passwords.
  return input === stored;
}

export function isHashedPassword(value?: string): boolean {
  return !!value && (value.startsWith(HASH_PREFIX) || value.startsWith('demo:'));
}
