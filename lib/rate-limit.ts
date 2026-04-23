/**
 * rate-limit.ts
 * Rate limiter en memoria para el endpoint de login de admin.
 *
 * Nota: funciona dentro de un proceso Node.js. En producción serverless
 * (Vercel lambdas) el estado se pierde entre invocaciones. Para máxima
 * robustez en serverless, migrar a Upstash Redis (@upstash/ratelimit).
 * Para este proyecto de un solo admin, esta implementación es suficiente.
 */

interface Record {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

// Singleton global — persiste durante la vida del proceso.
const store = new Map<string, Record>();

const WINDOW_MS = 15 * 60 * 1000;   // ventana de 15 minutos
const MAX_FAILURES = 5;               // máx. intentos fallidos en la ventana
const BLOCK_MS = 60 * 60 * 1000;    // bloqueo de 1 hora al superar el límite

/** Comprueba si una IP está bloqueada actualmente. */
export function isRateLimited(ip: string): { limited: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const rec = store.get(ip);

  if (!rec) return { limited: false };

  // ¿Está bloqueada?
  if (rec.blockedUntil !== null && now < rec.blockedUntil) {
    return { limited: true, retryAfterSec: Math.ceil((rec.blockedUntil - now) / 1000) };
  }

  // ¿Venció la ventana de tiempo? → limpiar
  if (now - rec.firstAttempt > WINDOW_MS) {
    store.delete(ip);
    return { limited: false };
  }

  return { limited: false };
}

/** Registra un intento fallido de login para una IP. */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const rec = store.get(ip);

  if (!rec || now - rec.firstAttempt > WINDOW_MS) {
    store.set(ip, { count: 1, firstAttempt: now, blockedUntil: null });
    return;
  }

  const newCount = rec.count + 1;
  const blockedUntil = newCount >= MAX_FAILURES ? now + BLOCK_MS : null;
  store.set(ip, { ...rec, count: newCount, blockedUntil });
}

/** Limpia los intentos fallidos tras un login exitoso. */
export function clearAttempts(ip: string): void {
  store.delete(ip);
}
