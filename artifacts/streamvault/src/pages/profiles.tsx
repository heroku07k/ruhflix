import { useState } from "react";
import { X, Check, Pencil, Trash2, ArrowLeft } from "lucide-react";

interface Profile {
  name: string;
  color: string;
  letter: string;
}

const DEFAULT_PROFILES: Profile[] = [];

const PALETTE = [
  "#E50914","#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#8b5cf6","#ec4899","#64748b","#78716c",
];

function loadProfiles(): Profile[] {
  try {
    const saved = localStorage.getItem("ruhflix_profiles_v2");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PROFILES;
}

function saveProfiles(profiles: Profile[]) {
  try { localStorage.setItem("ruhflix_profiles_v2", JSON.stringify(profiles)); } catch {}
}

interface ProfilesPageProps {
  onSelect: (name: string) => void;
}

type Mode = "select" | "manage" | "create" | "edit";

export default function ProfilesPage({ onSelect }: ProfilesPageProps) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [mode, setMode] = useState<Mode>("select");

  // Create / Edit form state
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(PALETTE[0]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  const openCreate = () => {
    setFormName(""); setFormColor(PALETTE[0]); setError("");
    setMode("create");
  };

  const openEdit = (idx: number) => {
    setFormName(profiles[idx].name);
    setFormColor(profiles[idx].color);
    setEditingIdx(idx);
    setError("");
    setMode("edit");
  };

  const handleSaveCreate = () => {
    const name = formName.trim();
    if (!name) { setError("Please enter a name"); return; }
    if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setError("Profile name already exists"); return;
    }
    const updated = [...profiles, { name, color: formColor, letter: name[0].toUpperCase() }];
    setProfiles(updated); saveProfiles(updated);
    setMode("manage");
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    const name = formName.trim();
    if (!name) { setError("Please enter a name"); return; }
    if (profiles.some((p, i) => i !== editingIdx && p.name.toLowerCase() === name.toLowerCase())) {
      setError("Profile name already exists"); return;
    }
    const updated = profiles.map((p, i) =>
      i === editingIdx ? { name, color: formColor, letter: name[0].toUpperCase() } : p
    );
    setProfiles(updated); saveProfiles(updated);
    setMode("manage");
  };

  const handleDelete = (idx: number) => {
    const updated = profiles.filter((_, i) => i !== idx);
    setProfiles(updated); saveProfiles(updated);
    setDeleteConfirm(null);
  };

  /* ── Form (Create or Edit) ── */
  if (mode === "create" || mode === "edit") {
    const isEdit = mode === "edit";
    return (
      <div style={containerStyle}>
        <button
          onClick={() => setMode(isEdit ? "manage" : "manage")}
          style={{ position: "absolute", top: 24, left: 24, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 400, marginBottom: 32 }}>
          {isEdit ? "Edit Profile" : "Create Profile"}
        </h1>

        {/* Avatar preview */}
        <div style={{ width: 100, height: 100, borderRadius: 4, background: formColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: "rgba(255,255,255,0.9)", marginBottom: 24, transition: "background 0.2s" }}>
          {formName ? formName[0].toUpperCase() : "?"}
        </div>

        {/* Name input */}
        <input
          autoFocus
          value={formName}
          onChange={(e) => { setFormName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") isEdit ? handleSaveEdit() : handleSaveCreate(); if (e.key === "Escape") setMode("manage"); }}
          placeholder="Profile name"
          maxLength={20}
          style={{
            width: "min(340px, 90vw)", padding: "12px 16px",
            background: "#454545", border: error ? "1px solid #E50914" : "1px solid transparent",
            color: "#fff", fontSize: "1rem", borderRadius: 4, outline: "none", marginBottom: 6,
          }}
        />
        {error && <p style={{ color: "#E50914", fontSize: 12, marginBottom: 8 }}>{error}</p>}

        {/* Color picker */}
        <div style={{ marginTop: 16, marginBottom: 28 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pick a colour</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {PALETTE.map((c) => (
              <button key={c} onClick={() => setFormColor(c)}
                style={{ width: 32, height: 32, borderRadius: 4, background: c, border: "none", cursor: "pointer", outline: formColor === c ? "3px solid #fff" : "none", outlineOffset: 2, display: "flex", alignItems: "center", justifyContent: "center", transition: "outline 0.1s" }}
              >
                {formColor === c && <Check size={16} color="#fff" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Delete option (edit only) */}
        {isEdit && editingIdx !== null && (
          <div style={{ marginBottom: 20 }}>
            {deleteConfirm === editingIdx ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 12 }}>Delete this profile?</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button onClick={() => { handleDelete(editingIdx); setMode("manage"); }}
                    style={{ background: "#E50914", color: "#fff", border: "none", padding: "8px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 2 }}>
                    Delete
                  </button>
                  <button onClick={() => setDeleteConfirm(null)}
                    style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.25)", padding: "8px 24px", fontSize: 13, cursor: "pointer", borderRadius: 2 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirm(editingIdx)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Trash2 size={14} /> Delete Profile
              </button>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={isEdit ? handleSaveEdit : handleSaveCreate}
            style={{ background: "#fff", color: "#000", border: "none", padding: "10px 32px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", borderRadius: 2 }}>
            Save
          </button>
          <button onClick={() => { setMode("manage"); setError(""); }}
            style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 32px", fontSize: "0.9rem", cursor: "pointer", borderRadius: 2 }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  /* ── Manage mode ── */
  if (mode === "manage") {
    return (
      <div style={containerStyle}>
        <button
          onClick={() => setMode("select")}
          style={{ position: "absolute", top: 24, left: 24, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 400, marginBottom: 48 }}>
          Manage Profiles
        </h1>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {profiles.map((p, idx) => (
            <div key={p.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 130, height: 130, borderRadius: 4, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 900, color: "rgba(255,255,255,0.9)", opacity: 0.85 }}>
                  {p.letter}
                </div>
                {/* Edit button overlay */}
                <button
                  onClick={() => openEdit(idx)}
                  style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", borderRadius: 4, border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#fff" }}
                >
                  <Pencil size={22} />
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>EDIT</span>
                </button>
              </div>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 500 }}>{p.name}</span>
            </div>
          ))}

          {/* Add profile */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button onClick={openCreate}
              style={{ width: 130, height: 130, borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "2px dashed rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 40, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              +
            </button>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Add Profile</span>
          </div>
        </div>

        <button
          onClick={() => setMode("select")}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.5)", padding: "10px 36px", fontSize: 14, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Done
        </button>
      </div>
    );
  }

  /* ── Select (default) ── */

  /* No profiles yet → show create prompt */
  if (profiles.length === 0) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#E50914", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(1.4rem,2.5vw,2rem)", letterSpacing: "-0.03em", marginBottom: 40 }}>RUHFLIX</p>
        <h1 style={{ color: "#fff", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 400, marginBottom: 12, letterSpacing: "-0.01em" }}>
          Create your profile
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 48, textAlign: "center", maxWidth: 320 }}>
          Choose a name and colour to get started
        </p>
        <button
          onClick={openCreate}
          style={{ background: "#E50914", color: "#fff", border: "none", padding: "14px 48px", fontSize: 15, fontWeight: 700, cursor: "pointer", borderRadius: 2, letterSpacing: "0.04em" }}
        >
          Create Profile
        </button>
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
          <button key={p.name} onClick={() => onSelect(p.name)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 0 }}
          >
            <div
              style={{ width: 130, height: 130, borderRadius: 4, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 900, color: "rgba(255,255,255,0.9)", transition: "outline 0.1s", outline: "3px solid transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.outline = "3px solid #fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.outline = "3px solid transparent"; }}
            >
              {p.letter}
            </div>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 500 }}>{p.name}</span>
          </button>
        ))}

        {/* Add profile */}
        <button onClick={openCreate}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 0 }}>
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
        onClick={() => setMode("manage")}
      >
        Manage Profiles
      </button>

      {/* Made by */}
      <p style={{
        position: "absolute",
        bottom: 28,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: 11,
        letterSpacing: "0.2em",
        color: "rgba(255,255,255,0.18)",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        userSelect: "none",
      }}>
        <span style={{ display: "inline-block", width: 22, height: 1, background: "rgba(255,255,255,0.12)" }} />
        crafted by
        <span style={{ color: "#E50914", fontStyle: "italic", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", textTransform: "none" }}>
          Ruhvaan
        </span>
        <span style={{ display: "inline-block", width: 22, height: 1, background: "rgba(255,255,255,0.12)" }} />
      </p>
    </div>
  );
}
