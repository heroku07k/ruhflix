import { DATA_PATH, imgBase } from "@/lib/endpoints";

export const fetchApi = async (endpoint: string, params: Record<string, string | number | boolean> = {}) => {
  const url = new URL(`${DATA_PATH}${endpoint}`, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, String(params[key]));
    }
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

export const getImageUrl = (path: string | null | undefined, size: 'w500' | 'w1280' = 'w500') => {
  if (!path) return '/placeholder-image.jpg';
  return `${imgBase()}/${size}${path}`;
};
