import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { useMovie } from "@/hooks/use-media";
import { getImageUrl } from "@/lib/api";
import { CastList } from "@/components/cast-list";
import { MediaRow } from "@/components/media-row";
import { DetailSkeleton } from "@/components/skeleton";
import { Play, Plus, Check, Heart, Star } from "lucide-react";
import { useUserData } from "@/contexts/user-data-context";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function MovieDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: movie, isLoading } = useMovie(id);
  const { toggleMyList, toggleLike, isInMyList, isLiked } = useUserData();

  if (isLoading) return <Layout><DetailSkeleton /></Layout>;
  if (!movie) return <Layout><div className="p-20 text-center text-white/40">Movie not found</div></Layout>;

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
  const matchPct = Math.round(((movie.vote_average ?? 0) / 10) * 100);
  const inList = isInMyList(movie.id);
  const liked   = isLiked(movie.id);

  const handlePlay = () => {
    const title = encodeURIComponent(movie.title || "");
    window.open(`${BASE}/watch/movie/${movie.id}?type=movie&title=${title}`, "_blank");
  };

  const handleToggleList = () => toggleMyList({
    id: movie.id, title: movie.title, posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path, mediaType: "movie",
    year: String(movie.release_date || ""), voteAverage: movie.vote_average ?? 0,
    overview: movie.overview,
  });

  return (
    <Layout>
      {/* Backdrop hero */}
      <div className="relative w-full" style={{ height: "60vw", maxHeight: 680, minHeight: 300 }}>
        <img
          src={getImageUrl(movie.backdrop_path, "w1280")}
          alt={movie.title}
          className="w-full h-full object-cover object-top"
          style={{ filter: "brightness(0.4)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #141414 0%, rgba(20,20,20,0.35) 50%, transparent 100%), linear-gradient(to right, rgba(20,20,20,0.95) 0%, transparent 60%)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-6" style={{ padding: "0 4% 36px" }}>
          <img
            src={getImageUrl(movie.poster_path, "w500")}
            alt={movie.title}
            className="hidden md:block rounded-sm shadow-2xl shrink-0"
            style={{ width: 130, aspectRatio: "2/3", objectFit: "cover" }}
          />

          <div className="flex-1 min-w-0">
            <h1
              className="text-white font-black leading-tight mb-2"
              style={{ fontSize: "clamp(1.6rem, 3.8vw, 3.2rem)", wordBreak: "break-word" }}
            >
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-white/40 italic text-sm mb-3 truncate">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              {matchPct > 0 && <span className="text-green-400 font-bold">{matchPct}% Match</span>}
              {year && <span className="text-white/55">{year}</span>}
              {movie.runtime && <span className="text-white/55">{movie.runtime}m</span>}
              <span className="border border-white/30 text-white/50 text-xs px-1.5 py-px">HD</span>
              {(movie.vote_average ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-white/55">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {movie.genres.map((g: any) => (
                  <span
                    key={g.id}
                    className="text-xs text-white/45 border border-white/12 px-2 py-0.5 rounded-sm"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 font-bold rounded-sm text-black transition hover:bg-white/80 active:scale-95"
                style={{ background: "#fff", padding: "10px 26px", fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                <Play size={18} className="fill-black shrink-0" />
                Play
              </button>
              <button
                onClick={handleToggleList}
                className="flex items-center gap-2 font-bold rounded-sm text-white transition active:scale-95"
                style={{ background: inList ? "#E50914" : "rgba(109,109,110,0.7)", padding: "10px 20px", fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                {inList ? <Check size={18} className="shrink-0" /> : <Plus size={18} className="shrink-0" />}
                {inList ? "In My List" : "My List"}
              </button>
              <button
                onClick={() => toggleLike({ id: movie.id, title: movie.title, posterPath: movie.poster_path, backdropPath: movie.backdrop_path, mediaType: "movie", year: String(movie.release_date || ""), voteAverage: movie.vote_average ?? 0, overview: movie.overview })}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition shrink-0"
                style={{ borderColor: liked ? "#E50914" : "rgba(255,255,255,0.4)", background: liked ? "rgba(229,9,20,0.15)" : "transparent" }}
              >
                <Heart size={16} className={liked ? "fill-red-500 text-red-500" : "text-white"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: "#141414", position: "relative", zIndex: 10 }}>
        <div className="grid md:grid-cols-3 gap-8 py-8" style={{ padding: "32px 4%" }}>
          <div className="md:col-span-2">
            <p className="text-white/75 leading-relaxed" style={{ fontSize: "0.95rem" }}>
              {movie.overview}
            </p>
          </div>
          <div className="text-sm space-y-2.5">
            {movie.credits?.cast?.length > 0 && (
              <p className="text-white/50">
                <span className="text-white/30">Cast: </span>
                {movie.credits.cast.slice(0, 4).map((c: any) => c.name).join(", ")}
              </p>
            )}
            {movie.genres?.length > 0 && (
              <p className="text-white/50">
                <span className="text-white/30">Genres: </span>
                {movie.genres.map((g: any) => g.name).join(", ")}
              </p>
            )}
            {year && (
              <p className="text-white/50">
                <span className="text-white/30">Year: </span>{year}
              </p>
            )}
          </div>
        </div>

        <CastList cast={movie.credits?.cast || []} />

        {movie.recommendations?.results?.length > 0 && (
          <MediaRow title="More Like This" items={movie.recommendations.results} />
        )}
      </div>
    </Layout>
  );
}
