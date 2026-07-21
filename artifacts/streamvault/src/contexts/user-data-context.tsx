import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface MediaItem {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  mediaType: "movie" | "tv";
  year?: string;
  voteAverage: number;
  overview?: string;
}

interface UserDataCtx {
  myList: MediaItem[];
  likedItems: MediaItem[];
  toggleMyList: (item: MediaItem) => void;
  toggleLike: (item: MediaItem) => void;
  isInMyList: (id: number) => boolean;
  isLiked: (id: number) => boolean;
}

const Ctx = createContext<UserDataCtx | null>(null);

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [myList,     setMyList]     = useState<MediaItem[]>(() => load("ruhflix_mylist", []));
  const [likedItems, setLikedItems] = useState<MediaItem[]>(() => {
    // Migrate old likes (number[]) to MediaItem[]
    const old = load<unknown>("ruhflix_likes", null);
    if (Array.isArray(old) && old.length > 0 && typeof old[0] === "number") return [];
    return (old as MediaItem[]) ?? [];
  });

  const toggleMyList = useCallback((item: MediaItem) => {
    setMyList((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const next = exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev];
      save("ruhflix_mylist", next);
      return next;
    });
  }, []);

  const toggleLike = useCallback((item: MediaItem) => {
    setLikedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const next = exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev];
      save("ruhflix_likes", next);
      return next;
    });
  }, []);

  const isInMyList = useCallback((id: number) => myList.some((i) => i.id === id), [myList]);
  const isLiked    = useCallback((id: number) => likedItems.some((i) => i.id === id), [likedItems]);

  return (
    <Ctx.Provider value={{ myList, likedItems, toggleMyList, toggleLike, isInMyList, isLiked }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUserData must be inside UserDataProvider");
  return ctx;
}
