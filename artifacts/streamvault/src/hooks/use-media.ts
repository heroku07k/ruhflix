import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export function useTrending(timeWindow: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ['trending', 'all', timeWindow],
    queryFn: () => fetchApi(`/trending/all/${timeWindow}`),
  });
}

export function useTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ['trending', 'movie', timeWindow],
    queryFn: () => fetchApi(`/trending/movie/${timeWindow}`),
  });
}

export function useTrendingTv(timeWindow: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ['trending', 'tv', timeWindow],
    queryFn: () => fetchApi(`/trending/tv/${timeWindow}`),
  });
}

export function usePopularMovies() {
  return useQuery({
    queryKey: ['popular', 'movie'],
    queryFn: () => fetchApi('/movie/popular'),
  });
}

export function usePopularTv() {
  return useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => fetchApi('/tv/popular'),
  });
}

export function useNowPlaying() {
  return useQuery({
    queryKey: ['now_playing', 'movie'],
    queryFn: () => fetchApi('/movie/now_playing'),
  });
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchApi(`/movie/${id}`, { append_to_response: 'credits,images,videos,recommendations' }),
    enabled: !!id,
  });
}

export function useTv(id: string) {
  return useQuery({
    queryKey: ['tv', id],
    queryFn: () => fetchApi(`/tv/${id}`, { append_to_response: 'credits,images,videos,recommendations,seasons' }),
    enabled: !!id,
  });
}

export function useTvSeason(tvId: string, seasonNumber: number) {
  return useQuery({
    queryKey: ['tv', tvId, 'season', seasonNumber],
    queryFn: () => fetchApi(`/tv/${tvId}/season/${seasonNumber}`),
    enabled: !!tvId && seasonNumber !== undefined,
  });
}

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => fetchApi('/search/multi', { query, page }),
    enabled: !!query,
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchApi(`/person/${id}`),
    enabled: !!id,
  });
}

export function usePersonCredits(id: string) {
  return useQuery({
    queryKey: ['person', id, 'credits'],
    queryFn: () => fetchApi(`/person/${id}/combined_credits`),
    enabled: !!id,
  });
}

export function useGenres(type: 'movie' | 'tv' = 'movie') {
  return useQuery({
    queryKey: ['genres', type],
    queryFn: () => fetchApi(`/genre/${type}/list`),
  });
}

export function useDiscover(type: 'movie' | 'tv' = 'movie', genreId?: string) {
  return useQuery({
    queryKey: ['discover', type, genreId],
    queryFn: () => fetchApi(`/discover/${type}`, genreId ? { with_genres: genreId } : {}),
  });
}
