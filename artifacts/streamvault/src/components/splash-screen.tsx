import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [tag, setTag] = useState("Movies");
  const [hiding, setHiding] = useState(false);

  const tags = ["Movies", "TV Shows", "Web Series", "Anime & More"];

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += 100 / 40;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setHiding(true);
        setTimeout(onDone, 700);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onDone]);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % tags.length;
      setTag(tags[i]);
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Barlow', -apple-system, BlinkMacSystemFont, sans-serif",
        opacity: hiding ? 0 : 1,
        transform: hiding ? "scale(1.04)" : "scale(1)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        overflow: "hidden",
      }}
    >
      {/* Aurora bg */}
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(40% 55% at 30% 40%, rgba(229,9,20,0.28) 0%, transparent 60%), radial-gradient(45% 55% at 75% 65%, rgba(140,0,10,0.22) 0%, transparent 65%), radial-gradient(60% 60% at 50% 50%, rgba(30,0,0,0.9), #050505 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(circle at center, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at center, #000 30%, transparent 75%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid rgba(229,9,20,0.35)",
            background: "rgba(229,9,20,0.08)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase" as const,
            color: "#ff5860",
            marginBottom: 28,
            animation: "rfUp 0.8s ease-out both",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ff2d3a",
              boxShadow: "0 0 8px #ff2d3a",
              display: "inline-block",
            }}
          />
          Streaming Hub
        </div>

        {/* Logo */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: "clamp(80px, 14vw, 160px)",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
            margin: 0,
            background: "linear-gradient(180deg, #fff 0%, #fff 45%, #ff3d47 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 24px rgba(229,9,20,0.35))",
            animation: "rfUp 0.9s cubic-bezier(0.2,0.7,0.2,1) 0.15s both",
          }}
        >
          RUHFLIX
        </h1>

        {/* Tagline cycling */}
        <p
          style={{
            marginTop: 18,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.45em",
            color: "rgba(255,255,255,0.5)",
            height: 14,
            animation: "rfUp 0.9s ease-out 0.3s both",
          }}
        >
          {tag}
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 40,
            width: "min(300px, 72vw)",
            animation: "rfUp 0.9s ease-out 0.45s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 10,
            }}
          >
            <span>Loading</span>
            <span style={{ color: "#fff" }}>{Math.round(progress)}%</span>
          </div>
          <div
            style={{
              position: "relative",
              height: 2,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #8a0009, #e50914, #ff5560)",
                boxShadow: "0 0 12px rgba(229,9,20,0.7)",
                borderRadius: 2,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes rfUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
