export function normalizeName(name) {
  if (!name && name !== '') return '';
  return String(name)
     .normalize('NFD')
     .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizePercentage(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  if (num > 1) return num / 100;
  return num;
}
