import { useState, useRef } from "react";
import { Link } from "wouter";
import { Play, Plus, Check, Heart, ChevronDown } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { useUserData } from "@/contexts/user-data-context";
import type { MediaItem } from "@/contexts/user-data-context";

interface PosterCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  voteAverage: number;
  mediaType: "movie" | "tv";
  year?: string;
  overview?: string;
}

function toMediaItem(p: PosterCardProps): MediaItem {
  return {
    id: p.id,
    title: p.title,
    posterPath: p.posterPath,
    backdropPath: p.backdropPath,
    mediaType: p.mediaType,
    year: p.year,
    voteAverage: p.voteAverage,
    overview: p.overview,
  };
}

/* ── Landscape card — main rows ── */
export function PosterCard(props: PosterCardProps) {
  const { id, title, posterPath, backdropPath, voteAverage, mediaType, year, overview } = props;
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toggleMyList, toggleLike, isInMyList, isLiked } = useUserData();
  const link = `/${mediaType === "movie" ? "movie" : "tv"}/${id}`;
  const img = backdropPath ? getImageUrl(backdropPath, "w500") : getImageUrl(posterPath, "w500");
  const matchPct = Math.round((voteAverage / 10) * 100);
  const inList = isInMyList(id);
  const liked  = isLiked(id);

  const onEnter = () => { timerRef.current = setTimeout(() => setHovered(true), 350); };
  const onLeave = () => { if (timerRef.current) clearTimeout(timerRef.current); setHovered(false); };

  return (
    <div className="relative" style={{ zIndex: hovered ? 20 : 1 }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link href={link}>
        <div
          className="relative cursor-pointer overflow-hidden rounded-sm"
          style={{
            aspectRatio: "16/9",
            background: "#1a1a1a",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            boxShadow: hovered ? "0 0 0 1px rgba(255,255,255,0.1)" : "none",
          }}
        >
          <img
            src={img} alt={title} className="w-full h-full object-cover" loading="lazy"
            style={{ display: "block", transition: "filter 0.25s", filter: hovered ? "brightness(0.5)" : "brightness(1)" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 p-2"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 70%)", opacity: hovered ? 0 : 1, transition: "opacity 0.2s" }}
          >
            <p className="text-white text-xs font-semibold leading-tight" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
          </div>
        </div>
      </Link>

      {hovered && (
        <div
          className="absolute left-0 right-0 rounded-sm overflow-hidden"
          style={{ top: "calc(100% - 8px)", background: "#181818", boxShadow: "0 6px 32px rgba(0,0,0,0.85)", zIndex: 30, border: "1px solid rgba(255,255,255,0.08)", animation: "fadeUp 0.18s ease" }}
        >
          <div style={{ aspectRatio: "16/9", background: "#222", position: "relative" }}>
            <img src={img} alt={title} className="w-full h-full object-cover" style={{ display: "block" }} />
            <div className="absolute bottom-0 left-0 right-0" style={{ height: "50%", background: "linear-gradient(to top, #181818, transparent)" }} />
          </div>

          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 mb-2.5 -mt-5 relative z-10">
              <Link href={link}>
                <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold transition-colors shrink-0" style={{ background: "#fff" }}>
                  <Play size={15} className="fill-black text-black" style={{ marginLeft: 2 }} />
                </button>
              </Link>
              {/* My List */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMyList(toMediaItem(props)); }}
                title={inList ? "Remove from My List" : "Add to My List"}
                className="w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0"
                style={{ background: inList ? "#E50914" : "rgba(42,42,42,0.85)", borderColor: inList ? "#E50914" : "rgba(255,255,255,0.4)" }}
              >
                {inList ? <Check size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
              </button>
              {/* Like */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(toMediaItem(props)); }}
                title={liked ? "Unlike" : "Like"}
                className="w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0"
                style={{ background: liked ? "rgba(229,9,20,0.2)" : "rgba(42,42,42,0.85)", borderColor: liked ? "#E50914" : "rgba(255,255,255,0.4)" }}
              >
                <Heart size={13} className={liked ? "fill-red-500 text-red-500" : "text-white"} />
              </button>
              <Link href={link} className="ml-auto">
                <button className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center transition-colors hover:border-white shrink-0" style={{ background: "rgba(42,42,42,0.85)" }}>
                  <ChevronDown size={15} className="text-white" />
                </button>
              </Link>
            </div>

            <p className="text-white font-bold text-sm mb-1.5 leading-tight" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {matchPct > 0 && <span className="text-green-400 font-bold text-xs">{matchPct}% Match</span>}
              {year && <span className="text-white/45 text-xs">{String(year).substring(0, 4)}</span>}
              <span className="text-xs border border-white/25 text-white/45 px-1" style={{ fontSize: 10, lineHeight: "16px" }}>HD</span>
            </div>

            {overview && (
              <p className="text-white/55 text-xs leading-relaxed" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {overview}
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ── Portrait card ── */
export function PortraitCard({ id, title, posterPath, voteAverage, mediaType, year, ...rest }: PosterCardProps) {
  const [hovered, setHovered] = useState(false);
  const { toggleMyList, isInMyList } = useUserData();
  const inList = isInMyList(id);
  const link = `/${mediaType === "movie" ? "movie" : "tv"}/${id}`;

  return (
    <Link href={link}>
      <div className="cursor-pointer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div
          className="relative overflow-hidden rounded-sm"
          style={{
            aspectRatio: "2/3",
            background: "#1a1a1a",
            transition: "transform 0.25s, box-shadow 0.25s",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)" : "none",
          }}
        >
          <img
            src={getImageUrl(posterPath, "w500")} alt={title} className="w-full h-full object-cover" loading="lazy"
            style={{ display: "block", filter: hovered ? "brightness(0.6)" : "brightness(1)", transition: "filter 0.25s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 42, height: 42, background: "rgba(255,255,255,0.95)" }}>
              <Play size={16} className="fill-black text-black" style={{ marginLeft: 2 }} />
            </div>
          </div>
          {voteAverage > 0 && (
            <div className="absolute top-1.5 right-1.5 font-bold text-white rounded-sm" style={{ background: "rgba(0,0,0,0.8)", fontSize: 10, padding: "2px 5px", backdropFilter: "blur(4px)" }}>
              {voteAverage.toFixed(1)}
            </div>
          )}
          {/* My List mini button on hover */}
          {hovered && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMyList({ id, title, posterPath, mediaType, year, voteAverage, ...rest }); }}
              style={{ position: "absolute", bottom: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: inList ? "#E50914" : "rgba(0,0,0,0.7)", border: "1.5px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              {inList ? <Check size={12} className="text-white" /> : <Plus size={12} className="text-white" />}
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }} />
        </div>
        <p className="mt-1.5 text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{title}</p>
      </div>
    </Link>
  );
}
