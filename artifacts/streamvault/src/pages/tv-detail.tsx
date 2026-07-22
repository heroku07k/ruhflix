import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useTv, useTvSeason } from "@/hooks/use-media";
import { getImageUrl } from "@/lib/api";
import { CastList } from "@/components/cast-list";
import { MediaRow } from "@/components/media-row";
import { DetailSkeleton } from "@/components/skeleton";
import { Play, Plus, Check, Heart, Star, ChevronDown } from "lucide-react";
import { useUserData } from "@/contexts/user-data-context";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function TvDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: tv, isLoading } = useTv(id);
  const { toggleMyList, toggleLike, isInMyList, isLiked } = useUserData();
  const [, navigate] = useLocation();

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const { data: seasonData, isLoading: seasonLoading } = useTvSeason(id, selectedSeason);

  useEffect(() => {
    if (tv?.seasons?.length > 0) {
      const s1 = tv.seasons.find((s: any) => s.season_number === 1);
      setSelectedSeason(s1 ? 1 : tv.seasons[0].season_number);
    }
  }, [tv]);

  if (isLoading) return <Layout><DetailSkeleton /></Layout>;
  if (!tv) return <Layout><div className="p-20 text-center text-white/40">TV Show not found</div></Layout>;

  const year = tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : "";
  const matchPct = Math.round(((tv.vote_average ?? 0) / 10) * 100);
  const validSeasons = tv.seasons?.filter((s: any) => s.season_number > 0) || [];
  const inList = isInMyList(tv.id);
  const liked   = isLiked(tv.id);

  const openWatch = (epNum: number) => {
    const title = encodeURIComponent(tv.name || "");
    navigate(`/watch/tv/${tv.id}/${selectedSeason}/${epNum}?type=tv&title=${title}&s=${selectedSeason}&e=${epNum}`);
  };

  const handleToggleList = () => toggleMyList({
    id: tv.id, title: tv.name, posterPath: tv.poster_path,
    backdropPath: tv.backdrop_path, mediaType: "tv",
    year: String(tv.first_air_date || ""), voteAverage: tv.vote_average ?? 0,
    overview: tv.overview,
  });

  return (
    <Layout>
      {/* Backdrop */}
      <div className="relative w-full" style={{ height: "60vw", maxHeight: 680, minHeight: 300 }}>
        <img
          src={getImageUrl(tv.backdrop_path, "w1280")}
          alt={tv.name}
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
            src={getImageUrl(tv.poster_path, "w500")}
            alt={tv.name}
            className="hidden md:block rounded-sm shadow-2xl shrink-0"
            style={{ width: 130, aspectRatio: "2/3", objectFit: "cover" }}
          />
          <div className="flex-1 min-w-0">
            <h1
              className="text-white font-black leading-tight mb-2"
              style={{ fontSize: "clamp(1.6rem, 3.8vw, 3.2rem)", wordBreak: "break-word" }}
            >
              {tv.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              {matchPct > 0 && <span className="text-green-400 font-bold">{matchPct}% Match</span>}
              {year && <span className="text-white/55">{year}</span>}
              <span className="text-white/55">{tv.number_of_seasons} Season{tv.number_of_seasons !== 1 ? "s" : ""}</span>
              {(tv.vote_average ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-white/55">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" />
                  {tv.vote_average.toFixed(1)}
                </span>
              )}
              <span
                className={`text-xs font-semibold px-1.5 py-px rounded-sm border ${
                  tv.status === "Ended"
                    ? "text-red-400/80 border-red-400/25"
                    : "text-green-400/80 border-green-400/25"
                }`}
              >
                {tv.status}
              </span>
            </div>
            {tv.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {tv.genres.map((g: any) => (
                  <span key={g.id} className="text-xs text-white/45 border border-white/12 px-2 py-0.5 rounded-sm">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => openWatch(1)}
                className="flex items-center gap-2 font-bold rounded-sm text-black transition hover:bg-white/80 active:scale-95"
                style={{ background: "#fff", padding: "10px 26px", fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                <Play size={18} className="fill-black shrink-0" /> Play
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
                onClick={() => toggleLike({ id: tv.id, title: tv.name, posterPath: tv.poster_path, backdropPath: tv.backdrop_path, mediaType: "tv", year: String(tv.first_air_date || ""), voteAverage: tv.vote_average ?? 0, overview: tv.overview })}
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
              {tv.overview}
            </p>
          </div>
          <div className="text-sm space-y-2.5">
            {tv.credits?.cast?.length > 0 && (
              <p className="text-white/50">
                <span className="text-white/30">Cast: </span>
                {tv.credits.cast.slice(0, 4).map((c: any) => c.name).join(", ")}
              </p>
            )}
            {tv.genres?.length > 0 && (
              <p className="text-white/50">
                <span className="text-white/30">Genres: </span>
                {tv.genres.map((g: any) => g.name).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Episodes section — always visible */}
        <div id="episodes-section" style={{ padding: "0 4% 48px" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold" style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}>
              Episodes
            </h2>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(Number(e.target.value));
                  setSelectedEpisode(1);
                  setPlayerOpen(false);
                }}
                className="appearance-none text-white font-semibold text-sm pr-7 pl-3 py-1.5 cursor-pointer outline-none rounded-sm"
                style={{
                  background: "#232323",
                  border: "1px solid rgba(255,255,255,0.12)",
                  minWidth: 160,
                }}
              >
                {validSeasons.map((season: any) => (
                  <option key={season.id} value={season.season_number} style={{ background: "#1a1a1a" }}>
                    {season.name} ({season.episode_count} eps)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* Episode list */}
          <div className="mb-6 space-y-px" style={{ maxWidth: 860 }}>
            {seasonLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-sm animate-pulse" style={{ height: 80, background: "#1e1e1e" }} />
                ))
              : seasonData?.episodes?.map((ep: any) => (
                  <button
                    key={ep.id}
                    onClick={() => openWatch(ep.episode_number)}
                    className="w-full text-left flex items-center gap-4 rounded-sm transition-colors"
                    style={{ padding: "12px 14px", borderLeft: "3px solid transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <span className="text-xl font-bold shrink-0 w-7 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {ep.episode_number}
                    </span>

                    {ep.still_path && (
                      <div className="shrink-0 rounded-sm overflow-hidden" style={{ width: 110, aspectRatio: "16/9", background: "#222" }}>
                        <img src={getImageUrl(ep.still_path, "w500")} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-white font-semibold text-sm truncate">{ep.name}</p>
                        {ep.runtime && <span className="text-white/30 text-xs shrink-0">{ep.runtime}m</span>}
                      </div>
                      {ep.overview && (
                        <p className="text-white/40 text-xs" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {ep.overview}
                        </p>
                      )}
                    </div>

                    <Play size={15} className="text-white/20 fill-white/20 shrink-0" />
                  </button>
                ))}
          </div>
        </div>

        <CastList cast={tv.credits?.cast || []} />

        {tv.recommendations?.results?.length > 0 && (
          <MediaRow title="More Like This" items={tv.recommendations.results} />
        )}
      </div>
    </Layout>
  );
}
