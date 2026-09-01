/**
 * Resolves full image URL for uploaded device photos, external links, and local public assets.
 */
export const getImageUrl = (url?: string | null, fallback = '/VKCAT.png'): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const cleanUrl = url.trim();

  // Base64 data URL, blob object, or absolute URL
  if (
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:') ||
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://')
  ) {
    return cleanUrl;
  }

  // Uploaded backend static files (resolves relative to production API origin)
  if (cleanUrl.startsWith('/uploads/')) {
    const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
    const backendBase = apiUrl.replace(/\/api(\/v1)?\/?$/, '');
    return backendBase ? `${backendBase}${cleanUrl}` : cleanUrl;
  }

  return cleanUrl;
};

/**
 * Universal onError handler for img elements to prevent broken image icons
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallback = '/VKCAT.png') => {
  const target = e.currentTarget;
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  }
};
