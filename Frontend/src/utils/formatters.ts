// ── Formateadores de datos ───────────────────────────────────────────────────

/**
 * Formatea fecha a "15 May 2025, 08:30"
 */
export function formatDate(datetime: string | Date): string {
  if (!datetime) return '—';
  const date = new Date(datetime);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formatea fecha corta a "15/05/2025"
 */
export function formatDateShort(datetime: string | Date): string {
  if (!datetime) return '—';
  const date = new Date(datetime);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea precio a "$185.00"
 */
export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

/**
 * Formatea duración en minutos a "3h 30min"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/**
 * Calcula minutos entre dos datetimes
 */
export function calcDuration(departure: string | Date, arrival: string | Date): number {
  const dep = new Date(departure).getTime();
  const arr = new Date(arrival).getTime();
  return Math.round((arr - dep) / 60_000);
}

/**
 * Fecha relativa: "hace 2 días" / "en 3 días"
 */
export function formatRelativeDate(datetime: string | Date): string {
  if (!datetime) return '—';
  const now = Date.now();
  const then = new Date(datetime).getTime();
  const diff = then - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / 60_000);
  const hours   = Math.floor(absDiff / 3_600_000);
  const days    = Math.floor(absDiff / 86_400_000);

  if (minutes < 1) return 'ahora mismo';

  let label: string;
  if (days > 0)        label = `${days} día${days > 1 ? 's' : ''}`;
  else if (hours > 0)  label = `${hours} hora${hours > 1 ? 's' : ''}`;
  else                 label = `${minutes} minuto${minutes > 1 ? 's' : ''}`;

  return diff < 0 ? `hace ${label}` : `en ${label}`;
}

/**
 * Convierte datetime a formato datetime-local para inputs HTML
 * "2026-06-01T08:00:00.000Z" → "2026-06-01T08:00"
 */
export function toDatetimeLocal(datetime: string | Date): string {
  if (!datetime) return '';
  const date = new Date(datetime);
  const offset = date.getTimezoneOffset() * 60_000;
  const local  = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
}
