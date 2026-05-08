// ── Validadores de formularios ───────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export interface PasswordStrength {
  valid: boolean;
  strength: 1 | 2 | 3 | 4;
  label: 'Débil' | 'Media' | 'Fuerte' | 'Muy fuerte';
  color: string;
  errors: string[];
}

export function isStrongPassword(password: string): PasswordStrength {
  const errors: string[] = [];

  if (password.length < 8)       errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password))   errors.push('Debe contener al menos una mayúscula');
  if (!/[a-z]/.test(password))   errors.push('Debe contener al menos una minúscula');
  if (!/[0-9]/.test(password))   errors.push('Debe contener al menos un número');

  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasDigit   = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength  = password.length >= 8;

  const score = [hasLength, hasUpper, hasLower, hasDigit, hasSpecial]
    .filter(Boolean).length;

  let strength: 1 | 2 | 3 | 4;
  let label: PasswordStrength['label'];
  let color: string;

  if (!hasLength || score <= 2) {
    strength = 1; label = 'Débil';        color = '#EF4444';
  } else if (score === 3) {
    strength = 2; label = 'Media';        color = '#F97316';
  } else if (score === 4) {
    strength = 3; label = 'Fuerte';       color = '#84CC16';
  } else {
    strength = 4; label = 'Muy fuerte';   color = '#10B981';
  }

  return { valid: errors.length === 0, strength, label, color, errors };
}

export function isValidFlightNumber(num: string): boolean {
  return /^[A-Z0-9]{1,10}$/.test(num);
}

export function isFutureDate(datetime: string): boolean {
  if (!datetime) return false;
  return new Date(datetime) > new Date();
}

export function isAfterDate(date: string, reference: string): boolean {
  if (!date || !reference) return false;
  return new Date(date) > new Date(reference);
}
