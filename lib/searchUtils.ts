/**
 * Utility functions for search and filtering
 */

/**
 * Remove Vietnamese diacritics (accents) for search
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return "";
  
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Check if search term matches text (case-insensitive, accent-insensitive)
 */
export function matchesSearch(text: string, searchTerm: string): boolean {
  if (!searchTerm) return true;
  if (!text) return false;

  const normalizedText = removeVietnameseAccents(text);
  const normalizedSearch = removeVietnameseAccents(searchTerm);

  return normalizedText.includes(normalizedSearch);
}

/**
 * Search in multiple fields
 */
export function searchInFields(
  item: any,
  searchTerm: string,
  fields: string[]
): boolean {
  if (!searchTerm) return true;

  return fields.some((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], item);
    return matchesSearch(String(value || ""), searchTerm);
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

