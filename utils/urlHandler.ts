
/**
 * Processes a raw input string into a valid URL.
 * - If it's a valid URL, returns it.
 * - If it looks like a domain, adds https.
 * - Otherwise, treats it as a search query.
 */
export const processUrlInput = (input: string): string => {
  const trimmed = input.trim();

  // If empty, do nothing (caller handles this)
  if (!trimmed) return '';

  // Already a URL?
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Looks like a domain? (e.g., example.com, test.io)
  const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (domainRegex.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Fallback for when the browser logic decides to search (Phase 2 legacy)
  // However, Phase 3 Logic prefers Chat for non-URLs.
  // This function is strictly for "Turn this string into a browser URL"
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
};

/**
 * Heuristic to determine if the input is intended as a URL navigation
 * or a natural language query.
 */
export const isValidUrl = (input: string): boolean => {
    const trimmed = input.trim();
    if (trimmed.includes(' ')) return false;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
    const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return domainRegex.test(trimmed);
};

/**
 * Checks if a URL is likely to block iframes (X-Frame-Options).
 */
export const isLikelyToBlock = (url: string): boolean => {
  const blockers = [
    'google.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'linkedin.com',
    'github.com',
    'youtube.com',
    'reddit.com',
    'amazon.com'
  ];
  return blockers.some(domain => url.includes(domain));
};