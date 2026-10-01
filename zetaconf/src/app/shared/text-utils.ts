export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchesSearch(fullName: string, query: string): boolean {
  const terms = normalizeText(query).trim().split(/\s+/).filter(t => t.length > 0);
  if (terms.length === 0) return true;

  const nameWords = normalizeText(fullName).split(/\s+/);
  return terms.every(term => nameWords.some(word => word.includes(term)));
}