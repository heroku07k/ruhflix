import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useSearch, usePopularMovies, usePopularTv } from "@/hooks/use-media";
import { PortraitCard } from "@/components/poster-card";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearch(debouncedQuery);
  const { data: popularMovies } = usePopularMovies();
  const { data: popularTv } = usePopularTv();

  const suggestions = [
    ...(popularMovies?.results?.slice(0, 6) || []).map((i: any) => ({ ...i, media_type: "movie" })),
    ...(popularTv?.results?.slice(0, 6) || []).map((i: any) => ({ ...i, media_type: "tv" })),
  ];

  const results = data?.results?.filter((item: any) => item.media_type !== "person") || [];

  return (
    <Layout>
      <div className="pt-24 px-4 md:px-12 pb-16" style={{ background: "#141414", minHeight: "100vh" }}>
        {/* Search input */}
        <div className="relative mb-10 max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search titles, people, genres"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-white text-lg pl-12 pr-4 py-3 outline-none rounded-sm"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              caretColor: "#E50914",
            }}
          />
        </div>

        {/* Results */}
        {debouncedQuery ? (
          <>
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm animate-pulse"
                    style={{ width: "100%", aspectRatio: "2/3", background: "#1f1f1f" }}
                  />
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <p className="text-white/50 text-sm mb-5">
                  {results.length} results for{" "}
                  <span className="text-white font-semibold">"{debouncedQuery}"</span>
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {results.map((item: any) => (
                    <PortraitCard
                      key={`${item.media_type}-${item.id}`}
                      id={item.id}
                      title={item.title || item.name}
                      posterPath={item.poster_path}
                      voteAverage={item.vote_average}
                      mediaType={item.media_type || "movie"}
                      year={item.release_date || item.first_air_date}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <SearchIcon size={48} className="mx-auto mb-4 text-white/20" />
                <h3 className="text-white font-bold text-xl mb-2">No results found</h3>
                <p className="text-white/40 text-sm">Try searching for something else</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-white font-bold text-lg mb-5">Popular on Ruhflix</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {suggestions.map((item: any) => (
                <PortraitCard
                  key={`${item.media_type}-${item.id}`}
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  mediaType={item.media_type || "movie"}
                  year={item.release_date || item.first_air_date}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
