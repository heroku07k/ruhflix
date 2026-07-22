import { ReactNode, useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bell, X, ChevronDown, Home, Film, Tv, TrendingUp } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [location, navigate] = useLocation();
  const browseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.background = "#141414";
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    { href: "/", label: "Home", icon: <Home size={15} /> },
    { href: "/search?type=movie", label: "Movies", icon: <Film size={15} /> },
    { href: "/search?type=tv", label: "TV Shows", icon: <Tv size={15} /> },
    { href: "/search", label: "New & Popular", icon: <TrendingUp size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#141414", color: "#fff" }}>
      {/* Mobile full-screen search overlay */}
      {searchOpen && (
        <div
          className="md:hidden fixed inset-0 z-[200] flex flex-col"
          style={{ background: "rgba(20,20,20,0.98)", backdropFilter: "blur(6px)" }}
        >
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-3"
            style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Search size={18} className="text-white/50 shrink-0" />
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search movies, shows, people..."
              className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/35"
              style={{ fontSize: 16 }}
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQ(""); }}
              className="text-white/50 text-sm font-medium px-2 py-1"
            >
              Cancel
            </button>
          </form>
          {/* Quick links when no query */}
          {!searchQ && (
            <div style={{ padding: "20px 16px" }}>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">Browse</p>
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => { navigate(link.href); setSearchOpen(false); }}
                  className="flex items-center gap-3 w-full text-left py-3"
                  style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, background: "none", border: "none", cursor: "pointer" }}
                >
                  <span className="text-white/40">{link.icon}</span>
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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

          {/* Mobile browse dropdown */}
          <div className="md:hidden flex items-center flex-1 min-w-0" ref={browseRef}>
            <button
              onClick={() => setBrowseOpen((o) => !o)}
              className="flex items-center gap-1"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span className="text-white/70 text-sm font-medium">Browse</span>
              <ChevronDown
                size={13}
                className="text-white/50 transition-transform"
                style={{ transform: browseOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {browseOpen && (
              <div
                className="absolute top-[60px] left-0 right-0 z-[100]"
                style={{ background: "rgba(20,20,20,0.98)", backdropFilter: "blur(6px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => { navigate(link.href); setBrowseOpen(false); }}
                    className="flex items-center gap-3 w-full text-left"
                    style={{ padding: "14px 20px", color: "rgba(255,255,255,0.78)", fontSize: 14, background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-white/40">{link.icon}</span>
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto shrink-0">
            {/* Desktop search */}
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                className="hidden md:flex items-center gap-2 border border-white/50 bg-black/95"
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
            ) : null}

            <button
              onClick={() => setSearchOpen(true)}
              className="text-white/70 hover:text-white transition-colors"
              style={{ display: searchOpen ? "none" : undefined }}
            >
              <Search size={19} />
            </button>

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

          {/* Made by */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "rgba(255,255,255,0.22)",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
              crafted with care by
              <span style={{
                color: "#E50914",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "0.06em",
                fontSize: 13,
                textTransform: "none",
              }}>
                Ruhvaan
              </span>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
