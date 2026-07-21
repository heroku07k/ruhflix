const BASE_URL = 'https://db.wingsdatabase.com/3';

export const fetchApi = async (endpoint: string, params: Record<string, string | number | boolean> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, String(params[key]));
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
};

export const getImageUrl = (path: string | null | undefined, size: 'w500' | 'w1280' = 'w500') => {
  if (!path) return '/placeholder-image.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
