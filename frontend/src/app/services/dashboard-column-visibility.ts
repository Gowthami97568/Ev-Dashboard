export function isHiddenDashboardColumn(column: string): boolean {
  const normalized = column.replace(/[_\s-]/g, '').toLowerCase();

  return normalized === 'id' ||
    (normalized.length > 3 && normalized.endsWith('id')) ||
    normalized.endsWith('uuid') ||
    /^(created|modified|updated)(date|at|on)$/.test(normalized);
}
