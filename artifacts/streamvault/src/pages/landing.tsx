import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Play, Tv, Smartphone, Download, Users } from "lucide-react";
import { DATA_PATH, imgBase } from "@/lib/endpoints";

const IMG = (p: string, w = "w342") => `${imgBase()}/${w}${p}`;

function useTrending() {
  return useQuery({
    queryKey: ["landing-trending"],
    queryFn: async () => {
      const [movies, tv] = await Promise.all([
        fetch(`${DATA_PATH}/trending/movie/week`).then((r) => r.json()),
        fetch(`${DATA_PATH}/trending/tv/week`).then((r) => r.json()),
      ]);
      return [...(movies.results || []), ...(tv.results || [])];
    },
    staleTime: 10 * 60 * 1000,
  });
}

function PosterGrid({ items }: { items: any[] }) {
  if (!items.length) return null;
  const posters = items.filter((m) => m.poster_path);
  const fill = (n: number) => {
    const out = [];
    while (out.length < n) out.push(...posters);
    return out.slice(0, n);
  };
  const row = (n: number) => fill(n);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.55 }}>
      {[
        { cls: "poster-row-left",  items: row(20) },
        { cls: "poster-row-right", items: row(22) },
        { cls: "poster-row-left2", items: row(18) },
        { cls: "poster-row-right2",items: row(20) },
      ].map((rowCfg, ri) => (
        <div key={ri} style={{ display: "flex", gap: 8, marginBottom: 8, width: "max-content" }} className={rowCfg.cls}>
          {/* doubled for seamless loop */}
          {[...rowCfg.items, ...rowCfg.items].map((m, i) => (
            <div key={i} style={{ width: 120, height: 180, flexShrink: 0, borderRadius: 4, overflow: "hidden", background: "#1a1a1a" }}>
              {m.poster_path && (
                <img
                  src={IMG(m.poster_path, "w185")}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: <Tv size={44} strokeWidth={1.2} />,
    title: "Watch on any screen",
    desc: "Stream on your TV, laptop, tablet, or phone. RUHFLIX works everywhere — no setup needed.",
  },
  {
    icon: <Download size={44} strokeWidth={1.2} />,
    title: "Zero cost, always",
    desc: "No hidden fees. No credit card. No subscription. Every movie and show is completely free.",
  },
  {
    icon: <Smartphone size={44} strokeWidth={1.2} />,
    title: "HD streaming",
    desc: "Crystal-clear video quality across multiple servers. Auto-switches if one goes down.",
  },
  {
    icon: <Users size={44} strokeWidth={1.2} />,
    title: "Family profiles",
    desc: "Create separate profiles for everyone at home. Kids, family, and personal — all in one place.",
  },
];

const FAQS = [
  {
    q: "What is RUHFLIX?",
    a: "RUHFLIX is a free streaming platform where you can watch unlimited movies and TV shows from around the world — no sign-up, no subscription, no credit card required.",
  },
  {
    q: "Is RUHFLIX really free?",
    a: "Yes, 100%. RUHFLIX is completely free to use. You don't need to enter any payment information or create an account. Just click Watch Now and start streaming.",
  },
  {
    q: "What can I watch on RUHFLIX?",
    a: "Thousands of movies and TV shows across genres — action, comedy, romance, thriller, sci-fi, Bollywood, Hollywood, and regional content in Hindi, Tamil, Telugu, Malayalam, and more.",
  },
  {
    q: "Which devices can I use?",
    a: "Any device with a web browser — smart TVs, laptops, PCs, tablets, and phones. No app download required.",
  },
  {
    q: "What if a video doesn't load?",
    a: "RUHFLIX has 5+ servers per title. If one doesn't load, just click a different server button at the top of the player. It auto-switches too.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid #414141", overflow: "hidden" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          background: "#2d2d2d",
          color: "#fff",
          fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
          fontWeight: 400,
          cursor: "pointer",
          border: "none",
          textAlign: "left",
          gap: 16,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#3a3a3a"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#2d2d2d"; }}
      >
        <span>{q}</span>
        <ChevronDown
          size={28}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
            color: "#fff",
          }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? 260 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease",
          background: "#2d2d2d",
        }}
      >
        <p style={{ padding: "0 24px 20px", color: "#fff", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)", lineHeight: 1.6, marginTop: 4 }}>
          {a}
        </p>
      </div>
    </div>
  );
}

interface LandingProps {
  onWatchNow: () => void;
}

export default function LandingPage({ onWatchNow }: LandingProps) {
  const { data: trending = [] } = useTrending();

  const topTrending = trending.slice(0, 10);

  return (
    <div style={{ background: "#141414", color: "#fff", fontFamily: "var(--app-font-sans)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <PosterGrid items={trending} />

        {/* gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(20,20,20,0.35) 40%, #141414 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 100%)" }} />

        {/* Nav */}
        <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 5%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#E50914", fontWeight: 900, fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.03em", fontFamily: "Arial Black, sans-serif" }}>
              RUH<span style={{ color: "#fff" }}>FLIX</span>
            </span>
          </div>
          <button
            onClick={onWatchNow}
            style={{
              background: "#E50914",
              color: "#fff",
              border: "none",
              padding: "8px 22px",
              borderRadius: 4,
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f6121d"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#E50914"; }}
          >
            Watch Now
          </button>
        </nav>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 5%",
            paddingBottom: 80,
          }}
        >
          <h1
            className="fade-up"
            style={{
              fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 700,
              marginBottom: 16,
            }}
          >
            Unlimited movies, shows, and more.
          </h1>
          <p
            className="fade-up-d1"
            style={{ fontSize: "clamp(1rem, 2.2vw, 1.35rem)", color: "rgba(255,255,255,0.85)", marginBottom: 10, fontWeight: 400 }}
          >
            100% free. No credit card. No sign-up.
          </p>
          <p
            className="fade-up-d2"
            style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)", color: "rgba(255,255,255,0.6)", marginBottom: 36 }}
          >
            Ready to watch? Hit the button below and start streaming instantly.
          </p>
          <button
            className="fade-up-d3"
            onClick={onWatchNow}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#E50914",
              color: "#fff",
              border: "none",
              padding: "16px 44px",
              borderRadius: 4,
              fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: "0 4px 32px rgba(229,9,20,0.4)",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f6121d";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#E50914";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <Play size={20} className="fill-white" /> Watch Now
          </button>
        </div>

        {/* bottom separator */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "#222" }} />
      </section>

      {/* ── TRENDING NOW ── */}
      {topTrending.length > 0 && (
        <section style={{ padding: "64px 5%" }}>
          <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)", fontWeight: 700, marginBottom: 28 }}>
            Trending Now
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {topTrending.map((item: any, idx: number) => (
              <div key={item.id} style={{ position: "relative", borderRadius: 4, overflow: "hidden", aspectRatio: "2/3", background: "#1a1a1a", cursor: "pointer" }}
                onClick={onWatchNow}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; (e.currentTarget as HTMLElement).style.transition = "transform 0.2s"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                {item.poster_path && (
                  <img src={IMG(item.poster_path, "w342")} alt={item.title || item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                )}
                {/* big number */}
                <div style={{
                  position: "absolute",
                  bottom: -4,
                  left: -2,
                  fontSize: "clamp(3.5rem, 7vw, 5.5rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  WebkitTextStroke: "3px #fff",
                  color: "transparent",
                  fontFamily: "Arial Black, sans-serif",
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                  textShadow: "0 0 20px rgba(0,0,0,0.8)",
                }}>
                  {idx + 1}
                </div>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
              </div>
            ))}
          </div>
          <div style={{ borderBottom: "8px solid #222", marginTop: 64 }} />
        </section>
      )}

      {/* ── FEATURES / MORE REASONS ── */}
      <section style={{ padding: "64px 5%" }}>
        <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)", fontWeight: 700, marginBottom: 28, textAlign: "center" }}>
          More reasons to watch
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 200,
              }}
            >
              <div>
                <h3 style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
              <div style={{ marginTop: 20, color: "rgba(229,9,20,0.8)" }}>{f.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ borderBottom: "8px solid #222", marginTop: 64 }} />
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "64px 5%", maxWidth: 860, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 2rem)", fontWeight: 700, marginBottom: 12, textAlign: "center" }}>
          Frequently Asked Questions
        </h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: 32, fontSize: "0.95rem" }}>
          Got questions? We've got answers.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>

        {/* CTA below FAQ */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, fontSize: "1rem" }}>
            Ready to watch? Start streaming instantly — completely free.
          </p>
          <button
            onClick={onWatchNow}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#E50914",
              color: "#fff",
              border: "none",
              padding: "14px 40px",
              borderRadius: 4,
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f6121d"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#E50914"; }}
          >
            <Play size={18} className="fill-white" /> Watch Now
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #333", padding: "40px 5%", marginTop: 40 }}>
        <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 24, fontSize: "0.9rem" }}>
          Questions? Just watch — it's free.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 32px", marginBottom: 28 }}>
          {["FAQ", "Watch Anywhere", "Privacy", "Speed Test", "About RUHFLIX", "Contact Us"].map((l) => (
            <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
            >{l}</a>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>
          © 2025 RUHFLIX. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
