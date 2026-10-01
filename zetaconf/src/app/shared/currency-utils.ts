export function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('es-CO');
}

export function parseCurrencyInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}