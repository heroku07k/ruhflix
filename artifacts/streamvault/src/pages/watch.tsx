import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { ArrowLeft, RotateCcw, SkipForward, Wifi } from "lucide-react";
import { getServers } from "@/lib/endpoints";
import { Analytics } from "@/lib/analytics";

type ServerDef = {
  id: string;
  label: string;
  movie: (id: string) => string;
  tv: (id: string, s: number, e: number) => string;
};

const SERVERS: ServerDef[] = (() => {
  const s = getServers();
  return [
    { id:"s1", label:"Source 1",  movie:(id)=>`${s.e}/embed/${id}`,               tv:(id,se,e)=>`${s.e}/embedtv/${id}&s=${se}&e=${e}` },
    { id:"s2", label:"Source 2",  movie:(id)=>`${s.f}/embed/movie?tmdb=${id}`,    tv:(id,se,e)=>`${s.f}/embed/tv?tmdb=${id}&season=${se}&episode=${e}` },
    { id:"s3", label:"Source 3",  movie:(id)=>`${s.b}/movie/${id}`,               tv:(id,se,e)=>`${s.b}/tv/${id}/${se}/${e}` },
    { id:"s4", label:"Source 4",  movie:(id)=>`${s.c}/movie/${id}`,               tv:(id,se,e)=>`${s.c}/tv/${id}/${se}/${e}` },
    { id:"s5", label:"Source 5",  movie:(id)=>`${s.a}/embed/movie/${id}`,         tv:(id,se,e)=>`${s.a}/embed/tv/${id}/${se}/${e}` },
    { id:"s6", label:"Source 6",  movie:(id)=>`${s.l}/?video_id=${id}&tmdb=1`,    tv:(id,se,e)=>`${s.l}/?video_id=${id}&tmdb=1&s=${se}&e=${e}` },
    { id:"s7", label:"Source 7",  movie:(id)=>`${s.g}/embed/movie/${id}`,         tv:(id,se,e)=>`${s.g}/embed/tv/${id}/${se}/${e}` },
    { id:"s8", label:"Source 8",  movie:(id)=>`${s.h}/embed/movie?tmdb=${id}`,    tv:(id,se,e)=>`${s.h}/embed/tv?tmdb=${id}&season=${se}&episode=${e}` },
    { id:"s9", label:"Source 9",  movie:(id)=>`${s.j}/embed/movie/${id}`,         tv:(id,se,e)=>`${s.j}/embed/tv/${id}/${se}/${e}` },
    { id:"s10",label:"Source 10", movie:(id)=>`${s.k}/movie/${id}`,               tv:(id,se,e)=>`${s.k}/tv/${id}?s=${se}&e=${e}` },
  ];
})();

const PROBE_TIMEOUT_MS = 4000;
const AUTO_SWITCH_MS  = 60000;
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

  useEffect(() => {
    const decoded = decodeURIComponent(title);
    if (decoded) document.title = `${decoded} | RUHFLIX`;
    return () => { document.title = "RUHFLIX"; };
  }, [title]);

  // Block ad redirects from iframe without sandbox
  useEffect(() => {
    const origin = window.location.origin;

    // Modern Chrome/Edge: Navigation API — intercepts iframe-triggered top-nav
    const nav = (window as any).navigation;
    if (nav) {
      const navHandler = (event: any) => {
        try {
          const dest: string = event.destination?.url ?? "";
          if (dest && !dest.startsWith(origin)) {
            event.preventDefault();
          }
        } catch {}
      };
      nav.addEventListener("navigate", navHandler);
      return () => nav.removeEventListener("navigate", navHandler);
    }

    // Fallback for older browsers: detect location change via polling and go back
    const watchedHref = window.location.href;
    const poll = setInterval(() => {
      if (window.location.origin !== origin) {
        window.history.back();
      }
    }, 300);
    // beforeunload fallback — last resort
    const handleUnload = (e: BeforeUnloadEvent) => {
      const leaving = document.activeElement?.tagName !== "A";
      if (leaving) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      clearInterval(poll);
      window.removeEventListener("beforeunload", handleUnload);
      void watchedHref;
    };
  }, []);

  const [serverIdx,      setServerIdx]      = useState(0);
  const [probing,        setProbing]        = useState(true);
  const [loading,        setLoading]        = useState(true);
  const [showFallback,   setShowFallback]   = useState(false);
  const [switching,      setSwitching]      = useState(false);
  const [brandSplash,    setBrandSplash]    = useState(true);
  const [brandFading,    setBrandFading]    = useState(false);
  const brandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    startBrandSplash();
    if (serverIdx === 0) {
      Analytics.videoStart(decodeURIComponent(title), type, params.id);
    }
    return clearTimers;
  }, [serverIdx, probing, startTimers]);

  const handleLoad = () => {
    setLoading(false);
    setShowFallback(false);
    // Do NOT clearTimers here — iframe "load" fires even for broken/empty embeds
    // (servers return 200 with an empty player). Timers keep running so the
    // fallback banner still appears at FALLBACK_SHOW_MS if nothing is playing.
  };

  const startBrandSplash = () => {
    if (brandTimer.current) clearTimeout(brandTimer.current);
    setBrandSplash(true);
    setBrandFading(false);
    brandTimer.current = setTimeout(() => {
      setBrandFading(true);
      setTimeout(() => setBrandSplash(false), 800);
    }, 8000);
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

        {/* RUHFLIX brand splash — covers 3rd-party player intro for 3.5s */}
        {brandSplash && !loading && !probing && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 15,
            background: "#000",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8,
            opacity: brandFading ? 0 : 1,
            transition: "opacity 0.8s ease",
            pointerEvents: "none",
          }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-1px", color: "#fff" }}>
                RUH<span style={{ color: "#E50914" }}>FLIX</span>
              </span>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "6px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>
                Free Streaming
              </p>
            </div>
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
