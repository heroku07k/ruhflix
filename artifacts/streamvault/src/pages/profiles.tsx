import { useState } from "react";
import { X, Check } from "lucide-react";

interface Profile {
  name: string;
  color: string;
  letter: string;
}

const DEFAULT_PROFILES: Profile[] = [
  { name: "Ruhvaan", color: "#E50914", letter: "R" },
  { name: "Family",  color: "#2563EB", letter: "F" },
  { name: "Kids",    color: "#16A34A", letter: "K" },
];

const PALETTE = [
  "#E50914","#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#8b5cf6","#ec4899","#64748b","#78716c",
];

function loadProfiles(): Profile[] {
  try {
    const saved = localStorage.getItem("ruhflix_profiles");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PROFILES;
}

function saveProfiles(profiles: Profile[]) {
  try { localStorage.setItem("ruhflix_profiles", JSON.stringify(profiles)); } catch {}
}

interface ProfilesPageProps {
  onSelect: (name: string) => void;
}

export default function ProfilesPage({ onSelect }: ProfilesPageProps) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [error, setError] = useState("");

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { setError("Please enter a name"); return; }
    if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setError("Profile name already exists");
      return;
    }
    const letter = name[0].toUpperCase();
    const updated = [...profiles, { name, color: newColor, letter }];
    setProfiles(updated);
    saveProfiles(updated);
    setCreating(false);
    setNewName("");
    setNewColor(PALETTE[0]);
    setError("");
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#141414",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--app-font-sans)",
    padding: "40px 20px",
  };

  if (creating) {
    return (
      <div style={containerStyle}>
        <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 400, marginBottom: 40 }}>
          Create Profile
        </h1>

        {/* Avatar preview */}
        <div
          style={{ width: 100, height: 100, borderRadius: 4, background: newColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: "rgba(255,255,255,0.9)", marginBottom: 28, transition: "background 0.2s" }}
        >
          {newName ? newName[0].toUpperCase() : "?"}
        </div>

        {/* Name input */}
        <input
          autoFocus
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
          placeholder="Profile name"
          maxLength={20}
          style={{
            width: "min(340px, 90vw)",
            padding: "12px 16px",
            background: "#454545",
            border: error ? "1px solid #E50914" : "1px solid transparent",
            color: "#fff",
            fontSize: "1rem",
            borderRadius: 4,
            outline: "none",
            marginBottom: 6,
          }}
        />
        {error && <p style={{ color: "#E50914", fontSize: 12, marginBottom: 12 }}>{error}</p>}

        {/* Color picker */}
        <div style={{ marginTop: 20, marginBottom: 32 }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Pick a colour
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: 32, height: 32, borderRadius: 4, background: c, border: "none", cursor: "pointer",
                  outline: newColor === c ? "3px solid #fff" : "none",
                  outlineOffset: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "outline 0.1s",
                }}
              >
                {newColor === c && <Check size={16} color="#fff" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleCreate}
            style={{ background: "#fff", color: "#000", border: "none", padding: "10px 32px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", borderRadius: 2 }}
          >
            Save
          </button>
          <button
            onClick={() => { setCreating(false); setError(""); setNewName(""); }}
            style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 32px", fontSize: "0.9rem", cursor: "pointer", borderRadius: 2 }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 400, marginBottom: 48, letterSpacing: "-0.01em" }}>
        Who's watching?
      </h1>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 56 }}>
        {profiles.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelect(p.name)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 0 }}
            className="group"
          >
            <div
              style={{ width: 130, height: 130, borderRadius: 4, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 900, color: "rgba(255,255,255,0.9)", transition: "outline 0.1s", outline: "3px solid transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.outline = "3px solid #fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.outline = "3px solid transparent"; }}
            >
              {p.letter}
            </div>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 500, letterSpacing: "0.01em" }}>{p.name}</span>
          </button>
        ))}

        {/* Add profile */}
        <button
          onClick={() => setCreating(true)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 0 }}
        >
          <div
            style={{ width: 130, height: 130, borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "2px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "rgba(255,255,255,0.4)", transition: "background 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.13)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          >
            +
          </div>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Add Profile</span>
        </button>
      </div>

      <button
        style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.5)", padding: "10px 36px", fontSize: 14, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#fff"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
        onClick={() => onSelect("Guest")}
      >
        Manage Profiles
      </button>
    </div>
  );
}
