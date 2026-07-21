import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { ArrowLeft, RotateCcw, SkipForward, Wifi } from "lucide-react";

type ServerDef = {
  id: string;
  label: string;
  movie: (id: string) => string;
  tv: (id: string, s: number, e: number) => string;
};

const SERVERS: ServerDef[] = [
  {
    id: "vidsrcto",
    label: "Source 1",
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv:    (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidlink",
    label: "Source 2",
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv:    (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "videasy",
    label: "Source 3",
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv:    (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: "2embed",
    label: "Source 4",
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv:    (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "vidsrcme",
    label: "Source 5",
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv:    (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
];

const PROBE_TIMEOUT_MS = 4000;
const AUTO_SWITCH_MS  = 15000;
const FALLBACK_SHOW_MS = 8000;

async function probeServers(
  servers: ServerDef[],
  type: "movie" | "tv",
  id: string,
  s: number,
  e: number,
): Promise<number> {
  const controllers = servers.map(() => new AbortController());
  const probes = servers.map((srv, idx) => {
    const url = type === "movie" ? srv.movie(id) : srv.tv(id, s, e);
    const timer = setTimeout(() => controllers[idx].abort(), PROBE_TIMEOUT_MS);
    return fetch(url, { mode: "no-cors", signal: controllers[idx].signal })
      .then(() => { clearTimeout(timer); return idx; })
      .catch(() => { clearTimeout(timer); return Promise.reject(idx); });
  });
  try {
    const winner = await Promise.any(probes);
    controllers.forEach((c, i) => { if (i !== winner) c.abort(); });
    return winner;
  } catch {
    return 0;
  }
}

export default function WatchPage() {
  const params   = useParams<{ id: string; season?: string; episode?: string }>();
  const search   = useSearch();
  const [, navigate] = useLocation();

  const qs         = new URLSearchParams(search);
  const type       = (qs.get("type") || "movie") as "movie" | "tv";
  const title      = qs.get("title") || "";
  const seasonNum  = Number(params.season  || qs.get("s") || 1);
  const episodeNum = Number(params.episode || qs.get("e") || 1);

  const [serverIdx,    setServerIdx]    = useState(0);
  const [probing,      setProbing]      = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [switching,    setSwitching]    = useState(false);

  const iframeRef     = useRef<HTMLIFrameElement>(null);
  const autoTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didProbe      = useRef(false);

  const clearTimers = () => {
    if (autoTimer.current)    clearTimeout(autoTimer.current);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
  };

  const startTimers = useCallback(() => {
    clearTimers();
    setShowFallback(false);
    fallbackTimer.current = setTimeout(() => setShowFallback(true), FALLBACK_SHOW_MS);
    autoTimer.current = setTimeout(() => {
      setSwitching(true);
      setTimeout(() => {
        setServerIdx((i) => (i + 1) % SERVERS.length);
        setSwitching(false);
        setLoading(true);
      }, 1000);
    }, AUTO_SWITCH_MS);
  }, []);

  useEffect(() => {
    if (didProbe.current) return;
    didProbe.current = true;
    setProbing(true);
    probeServers(SERVERS, type, params.id, seasonNum, episodeNum).then((best) => {
      setServerIdx(best);
      setProbing(false);
      setLoading(true);
    });
    return clearTimers;
  }, []);

  useEffect(() => {
    if (probing) return;
    setLoading(true);
    startTimers();
    return clearTimers;
  }, [serverIdx, probing, startTimers]);

  const handleLoad = () => {
    setLoading(false);
    clearTimers();
    setShowFallback(false);
  };

  const handleNextServer = () => {
    clearTimers();
    setServerIdx((i) => (i + 1) % SERVERS.length);
    setLoading(true);
    setShowFallback(false);
  };

  const handleRetry = () => {
    setLoading(true);
    if (iframeRef.current) {
      const s = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => { if (iframeRef.current) iframeRef.current.src = s; }, 80);
    }
    startTimers();
  };

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else navigate(type === "movie" ? `/movie/${params.id}` : `/tv/${params.id}`);
  };

  const server = SERVERS[serverIdx];
  const src = type === "movie"
    ? server.movie(params.id)
    : server.tv(params.id, seasonNum, episodeNum);
  const iframeKey = `${server.id}-${params.id}-${seasonNum}-${episodeNum}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", zIndex: 1 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 600px) {
          .watch-bar { padding: 8px 12px !important; }
          .watch-title { font-size: 13px !important; }
          .watch-next-btn { padding: 9px 14px !important; font-size: 13px !important; }
          .watch-retry-btn { width: 36px !important; height: 36px !important; }
          .watch-back-btn { font-size: 13px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="watch-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px",
          background: "rgba(0,0,0,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          minHeight: 52,
        }}
      >
        <button
          className="watch-back-btn"
          onClick={goBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            padding: "6px 0",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <ArrowLeft size={17} /> Back
        </button>

        <span
          className="watch-title"
          style={{
            color: "rgba(255,255,255,0.75)",
            fontWeight: 600,
            fontSize: 14,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
          {type === "tv" && ` — S${String(seasonNum).padStart(2, "0")}E${String(episodeNum).padStart(2, "0")}`}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Next Server — prominent */}
          <button
            className="watch-next-btn"
            onClick={handleNextServer}
            disabled={probing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 6,
              background: probing ? "rgba(255,255,255,0.04)" : "rgba(229,9,20,0.18)",
              border: `1px solid ${probing ? "rgba(255,255,255,0.08)" : "rgba(229,9,20,0.45)"}`,
              color: probing ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.85)",
              cursor: probing ? "default" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "background 0.15s, border-color 0.15s",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => { if (!probing) (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.3)"; }}
            onMouseLeave={(e) => { if (!probing) (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.18)"; }}
          >
            <SkipForward size={14} />
            Next Server
          </button>

          {/* Retry */}
          <button
            className="watch-retry-btn"
            onClick={handleRetry}
            title="Retry"
            style={{
              width: 38,
              height: 38,
              borderRadius: 6,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.45)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Player area */}
      <div style={{ flex: 1, position: "relative" }} onContextMenu={(e) => e.preventDefault()}>

        {/* Loading / probing overlay */}
        {(probing || loading) && (
          <div style={{
            position: "absolute", inset: 0, background: "#000",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: 10, gap: 18,
          }}>
            <div style={{ position: "relative", width: 56, height: 56 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(229,9,20,0.15)", borderTopColor: "#E50914", animation: "spin 0.85s linear infinite" }} />
              <div style={{ position: "absolute", inset: 9, borderRadius: "50%", border: "2px solid rgba(229,9,20,0.08)", borderTopColor: "rgba(229,9,20,0.4)", animation: "spin 1.3s linear infinite reverse" }} />
            </div>

            <div style={{ textAlign: "center", padding: "0 24px" }}>
              {probing ? (
                <>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: 0, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <Wifi size={15} style={{ color: "#E50914" }} />
                    Finding best source…
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "6px 0 0" }}>
                    Checking {SERVERS.length} sources simultaneously
                  </p>
                </>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
                  {switching ? "Switching source…" : "Loading…"}
                </p>
              )}
            </div>

            {/* Fallback button inside overlay */}
            {showFallback && !switching && !probing && (
              <button
                onClick={handleNextServer}
                style={{
                  marginTop: 6,
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(229,9,20,0.15)",
                  border: "1px solid rgba(229,9,20,0.4)",
                  color: "rgba(255,255,255,0.85)",
                  padding: "11px 24px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  animation: "slideUp 0.3s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <SkipForward size={15} />
                Try Next Server
              </button>
            )}
          </div>
        )}

        {/* Floating "not loading?" banner — bottom of screen, after 8s, dismissible */}
        {showFallback && !loading && !probing && !switching && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              animation: "slideUp 0.35s ease",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(20,20,20,0.96)",
              border: "1px solid rgba(229,9,20,0.4)",
              borderRadius: 10,
              padding: "10px 18px",
              boxShadow: "0 4px 30px rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Not loading?</span>
            <button
              onClick={handleNextServer}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "#E50914",
                border: "none",
                color: "#fff",
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <SkipForward size={13} />
              Try Next Server
            </button>
          </div>
        )}

        {!probing && (
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={src}
            onLoad={handleLoad}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            title={title || "RUHFLIX Player"}
          />
        )}
      </div>
    </div>
  );
}
