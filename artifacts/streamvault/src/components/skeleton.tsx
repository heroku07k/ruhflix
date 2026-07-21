/* Netflix-style shimmer skeleton components */

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        ...style,
      }}
    />
  );
}

export function HeroSkeleton() {
  return (
    <div
      className="relative w-full"
      style={{ height: "80vh", minHeight: 500, background: "#111" }}
    >
      {/* Fake backdrop shimmer */}
      <Shimmer className="absolute inset-0" />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #141414 0%, transparent 60%), linear-gradient(to right, rgba(20,20,20,0.95) 0%, transparent 70%)",
        }}
      />

      {/* Content area */}
      <div className="absolute bottom-0 left-0 px-8 md:px-16 pb-32 flex flex-col gap-4" style={{ maxWidth: 550 }}>
        {/* Title skeleton */}
        <Shimmer className="rounded-sm h-12 md:h-16" style={{ width: 380 }} />
        {/* Description lines */}
        <Shimmer className="rounded-sm h-4" style={{ width: "100%" }} />
        <Shimmer className="rounded-sm h-4" style={{ width: "85%" }} />
        <Shimmer className="rounded-sm h-4" style={{ width: "70%" }} />
        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <Shimmer className="rounded-sm h-11" style={{ width: 110 }} />
          <Shimmer className="rounded-sm h-11" style={{ width: 140 }} />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton({ portrait = false }: { portrait?: boolean }) {
  const cardW = portrait ? 150 : 220;
  const cardAspect = portrait ? "2/3" : "16/9";

  return (
    <div className="mb-8 px-4 md:px-12">
      {/* Row title */}
      <Shimmer className="rounded-sm mb-4 h-5" style={{ width: 160 }} />
      {/* Cards */}
      <div className="flex gap-1 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Shimmer
            key={i}
            className="shrink-0 rounded-sm"
            style={{ width: cardW, aspectRatio: cardAspect }}
          />
        ))}
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div style={{ background: "#141414" }}>
      <HeroSkeleton />
      <div style={{ marginTop: -80, position: "relative", zIndex: 10 }}>
        <RowSkeleton />
        <RowSkeleton portrait />
        <RowSkeleton />
        <RowSkeleton portrait />
      </div>

      {/* Inject the shimmer keyframe once */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div style={{ background: "#141414" }}>
      {/* Backdrop */}
      <Shimmer
        className="w-full"
        style={{ height: "55vw", maxHeight: 680 }}
      />

      {/* Info */}
      <div className="px-4 md:px-12 py-10 space-y-4">
        <Shimmer className="rounded-sm h-10" style={{ width: 280 }} />
        <Shimmer className="rounded-sm h-4" style={{ width: 200 }} />
        <div className="flex gap-3 pt-4">
          <Shimmer className="rounded-sm h-11" style={{ width: 110 }} />
          <Shimmer className="rounded-sm h-11" style={{ width: 120 }} />
        </div>
        <div className="pt-6 space-y-2">
          <Shimmer className="rounded-sm h-4" style={{ width: "100%", maxWidth: 600 }} />
          <Shimmer className="rounded-sm h-4" style={{ width: "90%", maxWidth: 540 }} />
          <Shimmer className="rounded-sm h-4" style={{ width: "75%", maxWidth: 450 }} />
        </div>
        {/* Player placeholder */}
        <div className="pt-6">
          <Shimmer className="rounded-sm" style={{ maxWidth: 800, aspectRatio: "16/9" }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
