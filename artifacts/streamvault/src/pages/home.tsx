import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { HeroBanner } from "@/components/hero-banner";
import { MediaRow } from "@/components/media-row";
import { HomePageSkeleton } from "@/components/skeleton";
import {
  useTrending,
  usePopularMovies,
  useNowPlaying,
  usePopularTv,
  useTrendingTv,
} from "@/hooks/use-media";
import { useUserData } from "@/contexts/user-data-context";

export default function Home() {
  const { data: trending, isLoading: trendingLoading } = useTrending("week");
  const { data: popularMovies, isLoading: popularMoviesLoading } = usePopularMovies();
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlaying();
  const { data: popularTv, isLoading: popularTvLoading } = usePopularTv();
  const { data: trendingTv } = useTrendingTv("week");
  const { myList } = useUserData();

  // Show skeleton for at least 1.2s so it's clearly visible (like Netflix)
  const [minWait, setMinWait] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setMinWait(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const dataReady = !trendingLoading && !popularMoviesLoading;
  const showSkeleton = !dataReady || minWait;

  return (
    <Layout>
      {showSkeleton ? (
        <HomePageSkeleton />
      ) : (
        <>
          <HeroBanner items={trending?.results || []} />

          <div
            style={{
              background: "#141414",
              marginTop: -80,
              position: "relative",
              zIndex: 10,
              paddingBottom: 48,
            }}
          >
            {myList.length > 0 && (
              <MediaRow
                title="My List"
                items={myList.map((m) => ({
                  id: m.id,
                  title: m.title,
                  poster_path: m.posterPath,
                  backdrop_path: m.backdropPath,
                  vote_average: m.voteAverage,
                  media_type: m.mediaType,
                  release_date: m.mediaType === "movie" ? m.year : undefined,
                  first_air_date: m.mediaType === "tv" ? m.year : undefined,
                  overview: m.overview,
                }))}
              />
            )}

            <MediaRow
              title="Trending Now"
              items={trending?.results || []}
              isLoading={trendingLoading}
            />

            <MediaRow
              title="Now Playing in Cinemas"
              items={nowPlaying?.results || []}
              isLoading={nowPlayingLoading}
              portrait
            />

            <MediaRow
              title="Popular Movies"
              items={popularMovies?.results || []}
              isLoading={popularMoviesLoading}
            />

            <MediaRow
              title="Trending TV Shows"
              items={trendingTv?.results || []}
              portrait
            />

            <MediaRow
              title="Popular TV Shows"
              items={popularTv?.results || []}
              isLoading={popularTvLoading}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
