import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { PosterCard, PortraitCard } from "./poster-card";
import { RowSkeleton } from "./skeleton";

interface MediaRowProps {
  title: string;
  items: any[];
  isLoading?: boolean;
  portrait?: boolean;
  exploreHref?: string;
}

export function MediaRow({ title, items, isLoading, portrait = false, exploreHref }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [rowHovered, setRowHovered] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.88;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const onScroll = () => {
    if (!rowRef.current) return;
    setShowLeft(rowRef.current.scrollLeft > 10);
    setShowRight(
      rowRef.current.scrollLeft + rowRef.current.clientWidth < rowRef.current.scrollWidth - 10
    );
  };

  if (isLoading) return <RowSkeleton portrait={portrait} />;
  if (!items || items.length === 0) return null;

  const cardW = portrait ? 148 : 230;

  return (
    <div
      className="mb-10"
      style={{ padding: "0 4%" }}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
    >
      {/* Row header */}
      <div className="flex items-center gap-3 mb-3">
        <h2
          className="font-bold text-white"
          style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.05rem)" }}
        >
          {title}
        </h2>
        {/* "Explore All" — appears on hover like Netflix */}
        {exploreHref && (
          <Link href={exploreHref}>
            <span
              className="text-xs font-semibold transition-all duration-300 cursor-pointer"
              style={{
                color: "#54b3d6",
                opacity: rowHovered ? 1 : 0,
                transform: rowHovered ? "translateX(0)" : "translateX(-8px)",
                display: "inline-block",
              }}
            >
              Explore All →
            </span>
          </Link>
        )}
      </div>

      <div className="relative" style={{ overflow: "visible" }}>
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-20 flex items-center justify-center transition-opacity duration-200"
          style={{
            width: 40,
            background: "linear-gradient(to right, rgba(20,20,20,0.95) 0%, transparent 100%)",
            opacity: showLeft && rowHovered ? 1 : 0,
            pointerEvents: showLeft && rowHovered ? "auto" : "none",
            left: -16,
          }}
        >
          <ChevronLeft size={30} className="text-white drop-shadow-lg" />
        </button>

        {/* Scrollable row */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="flex overflow-x-auto"
          style={{ gap: 4, scrollbarWidth: "none", msOverflowStyle: "none", overflow: "visible auto" }}
        >
          <style>{`.no-scroll::-webkit-scrollbar { display: none; }`}</style>
          {items.map((item) => {
            const mediaType: "movie" | "tv" = item.media_type
              ? item.media_type === "movie" ? "movie" : "tv"
              : item.title ? "movie" : "tv";
            const sharedProps = {
              id: item.id,
              title: item.title || item.name || "",
              posterPath: item.poster_path,
              backdropPath: item.backdrop_path,
              voteAverage: item.vote_average ?? 0,
              mediaType,
              year: item.release_date || item.first_air_date,
              overview: item.overview,
            };
            return (
              <div key={item.id} style={{ minWidth: cardW, flexShrink: 0 }}>
                {portrait ? <PortraitCard {...sharedProps} /> : <PosterCard {...sharedProps} />}
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-center transition-opacity duration-200"
          style={{
            width: 40,
            background: "linear-gradient(to left, rgba(20,20,20,0.95) 0%, transparent 100%)",
            opacity: showRight && rowHovered ? 1 : 0,
            pointerEvents: showRight && rowHovered ? "auto" : "none",
            right: -16,
          }}
        >
          <ChevronRight size={30} className="text-white drop-shadow-lg" />
        </button>
      </div>
    </div>
  );
}
