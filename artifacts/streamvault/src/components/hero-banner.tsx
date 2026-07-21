import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, VolumeX, Volume2 } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { HeroSkeleton } from "./skeleton";

export function HeroBanner({ items }: { items: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 6));
    }, 9000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return <HeroSkeleton />;

  const item = items[currentIndex];
  const isMovie = item.media_type === "movie" || !item.media_type;
  const title = item.title || item.name || "";
  const link = `/${isMovie ? "movie" : "tv"}/${item.id}`;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "80vh", minHeight: 480 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(item.backdrop_path, "w1280")}
            alt={title}
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.5)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(77deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, transparent 100%), linear-gradient(to top, #141414 0%, rgba(20,20,20,0.5) 40%, transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content — strictly left-aligned, max-width capped */}
      <div
        className="absolute bottom-0 left-0 flex flex-col justify-end"
        style={{
          padding: "0 4% 120px",
          maxWidth: 640,
          width: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${item.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Title — controlled font size to prevent overflow */}
            <h1
              className="font-black text-white leading-tight mb-4"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 3.5rem)",
                textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {title}
            </h1>

            {/* Overview — 3 lines max, always hidden on small screens */}
            <p
              className="text-white/85 mb-6 hidden sm:block"
              style={{
                fontSize: "clamp(0.8rem, 1.3vw, 1rem)",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                maxWidth: 520,
              }}
            >
              {item.overview}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link href={link}>
                <button
                  className="flex items-center gap-2 font-bold rounded-sm text-black transition-all hover:bg-white/80 active:scale-95"
                  style={{
                    background: "#fff",
                    padding: "8px 24px",
                    fontSize: "clamp(0.8rem, 1.2vw, 1rem)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Play size={18} className="fill-black shrink-0" />
                  Play
                </button>
              </Link>
              <Link href={link}>
                <button
                  className="flex items-center gap-2 font-bold rounded-sm text-white transition-all hover:bg-white/20 active:scale-95"
                  style={{
                    background: "rgba(109,109,110,0.7)",
                    padding: "8px 20px",
                    fontSize: "clamp(0.8rem, 1.2vw, 1rem)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Info size={18} className="shrink-0" />
                  More Info
                </button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mute + rating — bottom right */}
      <div
        className="absolute flex items-center gap-3"
        style={{ bottom: 110, right: "4%" }}
      >
        <button
          onClick={() => setMuted(!muted)}
          className="w-9 h-9 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:border-white transition-colors"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <span
          className="text-white/75 text-xs font-semibold px-2 py-0.5 border border-white/35"
          style={{ background: "rgba(51,51,51,0.6)" }}
        >
          16+
        </span>
      </div>

      {/* Dot indicators */}
      <div
        className="absolute flex gap-1.5"
        style={{ bottom: 80, right: "4%" }}
      >
        {items.slice(0, 6).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="rounded-full transition-all"
            style={{
              width: i === currentIndex ? 20 : 8,
              height: 3,
              background: i === currentIndex ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
