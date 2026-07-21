import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { usePerson, usePersonCredits } from "@/hooks/use-media";
import { getImageUrl } from "@/lib/api";
import { PortraitCard } from "@/components/poster-card";
import { MapPin, CalendarDays } from "lucide-react";

export default function PersonDetail() {
  const params = useParams();
  const id = params.id as string;

  const { data: person, isLoading: personLoading } = usePerson(id);
  const { data: credits, isLoading: creditsLoading } = usePersonCredits(id);

  if (personLoading || creditsLoading) {
    return (
      <Layout>
        <div className="pt-24 px-4 md:px-12" style={{ background: "#141414", minHeight: "100vh" }}>
          <div className="flex gap-8">
            <div className="w-48 rounded animate-pulse shrink-0" style={{ aspectRatio: "2/3", background: "#222" }} />
            <div className="flex-1 space-y-3 pt-4">
              <div className="h-8 w-48 rounded animate-pulse" style={{ background: "#222" }} />
              <div className="h-4 w-32 rounded animate-pulse" style={{ background: "#222" }} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!person) return <Layout><div className="p-20 text-center text-white/40">Person not found</div></Layout>;

  const knownFor = credits?.cast
    ? [...new Map(credits.cast.map((item: any) => [item.id, item])).values()]
        .sort((a: any, b: any) => b.vote_average - a.vote_average)
        .slice(0, 18)
    : [];

  return (
    <Layout>
      <div className="pt-24 px-4 md:px-12 pb-16" style={{ background: "#141414", minHeight: "100vh" }}>
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Photo */}
          <div className="shrink-0">
            <div className="rounded overflow-hidden" style={{ width: 180, aspectRatio: "2/3", background: "#1f1f1f" }}>
              {person.profile_path ? (
                <img
                  src={getImageUrl(person.profile_path, "w500")}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-bold">
                  {person.name?.[0]}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-white font-black text-3xl md:text-4xl mb-2">{person.name}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-6">
              {person.known_for_department && (
                <span className="text-white/70">{person.known_for_department}</span>
              )}
              {person.birthday && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  {new Date(person.birthday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {person.place_of_birth}
                </span>
              )}
            </div>

            {person.biography && (
              <div>
                <h2 className="text-white font-bold text-base mb-3">Biography</h2>
                <div className="text-white/60 leading-relaxed text-sm space-y-3 max-w-3xl">
                  {person.biography.split("\n\n").slice(0, 4).map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Known for */}
        {knownFor.length > 0 && (
          <>
            <h2 className="text-white font-bold text-lg mb-5">Known For</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {knownFor.map((item: any) => (
                <PortraitCard
                  key={`${item.media_type}-${item.id}`}
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  mediaType={item.media_type || "movie"}
                  year={item.release_date || item.first_air_date}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
