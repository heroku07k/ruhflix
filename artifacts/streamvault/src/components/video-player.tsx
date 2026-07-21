import { useState, useEffect } from "react";
import { Play, Server, Languages } from "lucide-react";

export type Language = "Hindi" | "English" | "Tamil" | "Telugu" | "Malayalam" | "Kannada";

interface VideoPlayerProps {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  autoStart?: boolean;
}

type ServerDef = {
  id: string;
  label: string;
  badge?: string;
  lang: boolean;
  movie: (id: number) => string;
  tv: (id: number, s: number, e: number) => string;
};

const RPM_BASES: Record<Language, string> = {
  Hindi:     "https://watchout-hindi.rpmplay.me",
  English:   "https://watchouteng.rpmvid.com",
  Tamil:     "https://watchout-tamil.rpmvid.com",
  Telugu:    "https://watchout-telugu.rpmvid.com",
  Malayalam: "https://watchout-malayalam.rpmvid.com",
  Kannada:   "https://watchout-kannada.rpmvid.com",
};

const SERVERS: ServerDef[] = [
  {
    id: "autoembed",
    label: "Server 1",
    lang: false,
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv:    (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "videasy",
    label: "Server 2",
    lang: false,
    movie: (id) => `https://player.videasy.to/movie/${id}`,
    tv:    (id, s, e) => `https://player.videasy.to/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrcme",
    label: "Server 3",
    lang: false,
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv:    (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "vidsrcnet",
    label: "Server 4",
    lang: false,
    movie: (id) => `https://vidsrc.net/embed/movie?tmdb=${id}`,
    tv:    (id, s, e) => `https://vidsrc.net/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "2embed",
    label: "Server 5",
    lang: false,
    movie: (id) => `https://2embed.cc/embed/${id}`,
    tv:    (id, s, e) => `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "rpm",
    label: "Desi",
    badge: "Hindi+",
    lang: true,
    movie: () => "",
    tv:    () => "",
  },
];

const LANGUAGES: Language[] = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];

function buildUrl(
  server: ServerDef,
  id: number,
  type: "movie" | "tv",
  lang: Language,
  s: number,
  e: number
): string {
  if (server.id === "rpm") {
    const base = RPM_BASES[lang];
    const u = new URL(base);
    u.searchParams.set("id", String(id));
    u.searchParams.set("type", type);
    if (type === "tv") {
      u.searchParams.set("s", String(s));
      u.searchParams.set("e", String(e));
    }
    return u.toString();
  }
  return type === "movie" ? server.movie(id) : server.tv(id, s, e);
}

export function VideoPlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
  title,
  autoStart = false,
}: VideoPlayerProps) {
  const [started, setStarted] = useState(autoStart);
  const [serverId, setServerId] = useState("autoembed");
  const [language, setLanguage] = useState<Language>("Hindi");

  useEffect(() => { setStarted(autoStart); }, [autoStart]);

  const server = SERVERS.find((s) => s.id === serverId)!;
  const src = buildUrl(server, tmdbId, type, language, season, episode);

  /* ── Thumbnail ── */
  if (!started) {
    return (
      <div
        className="relative w-full rounded-sm overflow-hidden cursor-pointer group"
        style={{ aspectRatio: "16/9", background: "#0a0a0a" }}
        onClick={() => setStarted(true)}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(229,9,20,0.12) 0%, transparent 65%), #0a0a0a",
          }}
        >
          <div
            className="transition-all duration-300 group-hover:scale-110"
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#E50914",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(229,9,20,0.5), 0 0 80px rgba(229,9,20,0.2)",
            }}
          >
            <Play size={32} className="fill-white text-white" style={{ marginLeft: 4 }} />
          </div>
          {title && (
            <p className="font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              {title}
            </p>
          )}
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>Click to play</p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92), transparent)" }}
        >
          <Server size={11} className="text-white/35" />
          <span className="text-white/35 text-xs mr-1">Server:</span>
          {SERVERS.map((s) => (
            <button
              key={s.id}
              onClick={(ev) => { ev.stopPropagation(); setServerId(s.id); setStarted(true); }}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded font-semibold transition-all"
              style={{
                background: serverId === s.id ? "#E50914" : "rgba(255,255,255,0.12)",
                color: "#fff",
                border: serverId === s.id ? "none" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {s.label}
              {s.badge && <span className="text-[9px] opacity-70">{s.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Active player ── */
  return (
    <div className="w-full rounded-sm overflow-hidden" style={{ background: "#000" }}>
      {/* Control bar */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-3 py-2.5"
        style={{ background: "#0c0c0c", borderBottom: "1px solid #1c1c1c" }}
      >
        <Server size={12} className="text-white/25 mr-1 shrink-0" />

        {SERVERS.map((s) => (
          <button
            key={s.id}
            onClick={() => setServerId(s.id)}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded font-semibold transition-all shrink-0"
            style={{
              background: serverId === s.id ? "#E50914" : "rgba(255,255,255,0.06)",
              color: serverId === s.id ? "#fff" : "rgba(255,255,255,0.4)",
              border: serverId === s.id ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {s.label}
            {s.badge && (
              <span
                className="text-[9px] px-1 py-px rounded-sm font-bold"
                style={{
                  background: serverId === s.id ? "rgba(255,255,255,0.2)" : "rgba(229,9,20,0.4)",
                  color: "#fff",
                }}
              >
                {s.badge}
              </span>
            )}
          </button>
        ))}

        {/* Language selector — Desi only */}
        {server.lang && (
          <>
            <span className="text-white/15 mx-0.5 text-sm">|</span>
            <Languages size={12} className="text-white/25 shrink-0" />
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="text-xs px-2.5 py-1 rounded font-semibold transition-all shrink-0"
                style={{
                  background: language === lang ? "#E50914" : "rgba(255,255,255,0.06)",
                  color: language === lang ? "#fff" : "rgba(255,255,255,0.4)",
                  border: language === lang ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {lang}
              </button>
            ))}
          </>
        )}

        {/* Close only */}
        <button
          onClick={() => setStarted(false)}
          className="ml-auto text-white/25 hover:text-white/60 transition-colors text-sm leading-none shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Iframe with sandbox to block ad redirects */}
      <div style={{ aspectRatio: "16/9" }}>
        <iframe
          key={`${serverId}-${language}-${season}-${episode}`}
          src={src}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          title={title || "Video Player"}
          style={{ border: "none", display: "block" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation allow-downloads"
        />
      </div>
    </div>
  );
}
