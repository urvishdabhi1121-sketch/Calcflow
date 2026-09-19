export function formatNumber(value, precision = 2) {
  if (value === null || value === undefined || !isFinite(value)) return '—';
  const rounded = Number(value.toFixed(precision));
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

export function formatCurrency(value, currency = 'USD', precision = 2) {
  if (value === null || value === undefined || !isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  } catch {
    return `$${formatNumber(value, precision)}`;
  }
}

export function formatPercent(value, precision = 1) {
  if (value === null || value === undefined || !isFinite(value)) return '—';
  return `${formatNumber(value, precision)}%`;
}

export function parseNumber(input) {
  if (typeof input === 'number') return input;
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

export function safeNumber(input, fallback = 0) {
  const n = parseNumber(input);
  return n === null ? fallback : n;
}