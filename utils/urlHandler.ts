
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

  // Fallback -> Search
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
};

/**
 * Transforms standard URLs into embeddable versions where possible.
 * e.g. youtube.com/watch?v=123 -> youtube.com/embed/123
 */
export const transformUrlForEmbed = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // YouTube Video Transformation
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      // already embed?
      if (urlObj.pathname.startsWith('/embed/')) return url;

      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      if (urlObj.hostname === 'youtu.be') {
          return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}?autoplay=1`;
      }
    }

    return url;
  } catch (e) {
    return url;
  }
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

export const BLOCKED_DOMAINS = [
  'google.com',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'amazon.com',
  'reddit.com',
  'wikipedia.org', // Often blocks embedding depending on region/settings
  'netflix.com',
  'whatsapp.com'
];

/**
 * Checks if a URL is likely to block iframes (X-Frame-Options).
 */
export const isLikelyToBlock = (url: string): boolean => {
  // Exception: If we successfully converted it to an embed URL, it won't block!
  if (url.includes('youtube.com/embed/')) return false;

  const lowerUrl = url.toLowerCase();
  
  return BLOCKED_DOMAINS.some(domain => lowerUrl.includes(domain));
};
