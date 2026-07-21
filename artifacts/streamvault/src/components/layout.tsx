import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bell, X, ChevronDown } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [location, navigate] = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.background = "#141414";
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search?type=movie", label: "Movies" },
    { href: "/search?type=tv", label: "TV Shows" },
    { href: "/search", label: "New & Popular" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#141414", color: "#fff" }}>
      {/* Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled
            ? "rgba(20,20,20,0.97)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
          backdropFilter: scrolled ? "blur(4px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
        }}
      >
        <div className="flex items-center h-[60px]" style={{ padding: "0 4%" }}>
          {/* Logo */}
          <Link href="/">
            <span
              className="cursor-pointer select-none shrink-0 mr-8"
              style={{
                color: "#E50914",
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              RUHFLIX
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1 min-w-0">
            {navLinks.map((link, i) => {
              const active = location === link.href || (link.href === "/" && location === "/");
              return (
                <Link key={i} href={link.href}>
                  <span
                    className="cursor-pointer text-[13px] font-medium whitespace-nowrap transition-colors"
                    style={{ color: active ? "#fff" : "rgba(255,255,255,0.68)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = active ? "#fff" : "rgba(255,255,255,0.68)")}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile browse */}
          <div className="md:hidden flex items-center gap-1 flex-1 text-sm">
            <span className="text-white/60 text-xs font-medium">Browse</span>
            <ChevronDown size={11} className="text-white/60" />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto shrink-0">
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                className="flex items-center gap-2 border border-white/50 bg-black/95"
                style={{ padding: "5px 12px" }}
              >
                <Search size={13} className="text-white/40 shrink-0" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                  style={{ width: "clamp(130px, 16vw, 230px)" }}
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQ(""); }}
                  className="text-white/35 hover:text-white/65 transition-colors"
                >
                  <X size={13} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <Search size={19} />
              </button>
            )}

            <Bell
              size={19}
              className="text-white/60 hover:text-white transition-colors cursor-pointer hidden md:block"
            />

            {/* Avatar → My List */}
            <div
              onClick={() => navigate("/my-list")}
              title="My Profile"
              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold cursor-pointer shrink-0 hover:ring-2 hover:ring-white transition-all"
              style={{ background: "#E50914" }}
            >
              R
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-16 py-12" style={{ padding: "48px 4%", background: "#141414" }}>
        <div className="max-w-3xl">
          <p
            className="font-black italic text-sm mb-5"
            style={{ color: "#E50914", letterSpacing: "-0.02em" }}
          >
            RUHFLIX
          </p>
          <div
            className="flex flex-wrap gap-x-5 gap-y-2 text-xs mb-5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {["FAQ", "Help Centre", "Account", "Privacy", "Cookie Preferences", "Corporate"].map((t) => (
              <span key={t} className="hover:underline cursor-pointer">{t}</span>
            ))}
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2024 Ruhflix. Data from public TMDB proxy. Not affiliated with any streaming service.
          </p>
        </div>
      </footer>
    </div>
  );
}
