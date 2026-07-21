import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useUserData } from "@/contexts/user-data-context";
import { getImageUrl } from "@/lib/api";
import { Heart, BookmarkCheck, Play, Trash2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function MediaGrid({
  items,
  onRemove,
}: {
  items: Array<{ id: number; title: string; posterPath: string | null; mediaType: "movie" | "tv"; year?: string; voteAverage: number }>;
  onRemove: (id: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((item) => {
        const link = `${BASE}/${item.mediaType === "movie" ? "movie" : "tv"}/${item.id}`;
        return (
          <div key={item.id} style={{ position: "relative" }} className="group">
            <Link href={`/${item.mediaType === "movie" ? "movie" : "tv"}/${item.id}`}>
              <div
                style={{
                  aspectRatio: "2/3",
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "#1a1a1a",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <img
                  src={getImageUrl(item.posterPath, "w500")}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "filter 0.2s" }}
                  className="group-hover:brightness-50"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  className="group-hover:opacity-100"
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play size={18} className="fill-black text-black" style={{ marginLeft: 2 }} />
                  </div>
                </div>
                {item.voteAverage > 0 && (
                  <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.8)", borderRadius: 3, fontSize: 10, fontWeight: 700, color: "#fff", padding: "2px 5px" }}>
                    {item.voteAverage.toFixed(1)}
                  </div>
                )}
              </div>
            </Link>

            {/* Remove button */}
            <button
              onClick={() => onRemove(item.id)}
              title="Remove"
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.75)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
              className="group-hover:opacity-100"
            >
              <Trash2 size={12} className="text-white/70" />
            </button>

            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.title}
            </p>
            {item.year && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{String(item.year).substring(0, 4)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyListPage() {
  const { myList, likedItems, toggleMyList, toggleLike } = useUserData();

  const profileName = (() => {
    try {
      const profiles = JSON.parse(localStorage.getItem("ruhflix_profiles") || "[]");
      return profiles[0]?.name || "My Profile";
    } catch { return "My Profile"; }
  })();

  const profileColor = (() => {
    try {
      const profiles = JSON.parse(localStorage.getItem("ruhflix_profiles") || "[]");
      return profiles[0]?.color || "#E50914";
    } catch { return "#E50914"; }
  })();

  const profileLetter = profileName[0]?.toUpperCase() || "R";

  return (
    <Layout>
      <div style={{ background: "#141414", minHeight: "100vh", paddingTop: 90, paddingBottom: 60 }}>
        <div style={{ padding: "0 4%" }}>

          {/* Profile header */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 48 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 6,
                background: profileColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {profileLetter}
            </div>
            <div>
              <h1 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                {profileName}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "4px 0 0" }}>
                {myList.length} saved · {likedItems.length} liked
              </p>
            </div>
          </div>

          {/* My List */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <BookmarkCheck size={20} style={{ color: "#E50914" }} />
              <h2 style={{ color: "#fff", fontSize: "clamp(1.1rem,2vw,1.35rem)", fontWeight: 700, margin: 0 }}>
                My List
              </h2>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 4 }}>
                {myList.length}
              </span>
            </div>

            {myList.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <BookmarkCheck size={40} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, margin: 0 }}>
                  Nothing saved yet — click <strong>+ My List</strong> on any movie or show
                </p>
              </div>
            ) : (
              <MediaGrid items={myList} onRemove={(id) => {
                const item = myList.find(i => i.id === id);
                if (item) toggleMyList(item);
              }} />
            )}
          </section>

          {/* Liked */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Heart size={20} style={{ color: "#E50914" }} />
              <h2 style={{ color: "#fff", fontSize: "clamp(1.1rem,2vw,1.35rem)", fontWeight: 700, margin: 0 }}>
                Liked
              </h2>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 4 }}>
                {likedItems.length}
              </span>
            </div>

            {likedItems.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <Heart size={40} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, margin: 0 }}>
                  Nothing liked yet — click ❤ on any movie or show
                </p>
              </div>
            ) : (
              <MediaGrid items={likedItems} onRemove={(id) => {
                const item = likedItems.find(i => i.id === id);
                if (item) toggleLike(item);
              }} />
            )}
          </section>

        </div>
      </div>
    </Layout>
  );
}
