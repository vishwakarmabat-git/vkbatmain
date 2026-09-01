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
  const normalizedPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  if (normalizedPath.startsWith('/uploads/')) {
    const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
    if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
      const backendBase = apiUrl.replace(/\/api(\/v1)?\/?$/, '');
      if (backendBase) {
        return `${backendBase}${normalizedPath}`;
      }
    }
    // Fallback directly to production Render backend origin on Vercel
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return `https://vkbatmain.onrender.com${normalizedPath}`;
    }
    return normalizedPath;
  }

  return normalizedPath;
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
