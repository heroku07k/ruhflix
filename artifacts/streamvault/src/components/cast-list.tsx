import { Link } from "wouter";
import { getImageUrl } from "@/lib/api";

export function CastList({ cast }: { cast: any[] }) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="mb-12 px-4 md:px-12">
      <h2 className="text-white font-bold text-base md:text-lg mb-4">Cast</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
        {cast.slice(0, 14).map((actor) => (
          <Link key={actor.id} href={`/person/${actor.id}`}>
            <div className="shrink-0 cursor-pointer group" style={{ width: 100 }}>
              <div
                className="rounded overflow-hidden mb-2"
                style={{ width: 100, height: 100, background: "#1f1f1f" }}
              >
                {actor.profile_path ? (
                  <img
                    src={getImageUrl(actor.profile_path, "w500")}
                    alt={actor.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-bold">
                    {actor.name?.[0]}
                  </div>
                )}
              </div>
              <p className="text-white text-xs font-semibold line-clamp-1">{actor.name}</p>
              <p className="text-white/40 text-xs line-clamp-1">{actor.character}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
