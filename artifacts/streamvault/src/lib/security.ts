const SAFE_NAME_RE = /^[a-zA-Z0-9\s'\-\.]{1,30}$/;
const HTML_TAG_RE  = /<[^>]*>/g;
const SCRIPT_RE    = /javascript\s*:/gi;

export function sanitizeName(input: string): { ok: boolean; value: string; error?: string } {
  let v = input.trim().replace(HTML_TAG_RE, "").replace(SCRIPT_RE, "");
  if (!v) return { ok: false, value: "", error: "Name cannot be empty" };
  if (v.length > 30) return { ok: false, value: v.slice(0, 30), error: "Name must be 30 characters or less" };
  if (!SAFE_NAME_RE.test(v)) return { ok: false, value: v, error: "Only letters, numbers, spaces, apostrophes and hyphens are allowed" };
  return { ok: true, value: v };
}

export function safeLocalGet<T>(key: string, fallback: T, validator?: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function safeLocalSet(key: string, value: unknown): boolean {
  try {
    const s = JSON.stringify(value);
    if (s.length > 500_000) return false;
    localStorage.setItem(key, s);
    return true;
  } catch {
    return false;
  }
}

export function isProfileArray(v: unknown): v is Array<{ name: string; color: string; letter: string }> {
  return (
    Array.isArray(v) &&
    v.length <= 10 &&
    v.every(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as any).name === "string" &&
        typeof (p as any).color === "string" &&
        typeof (p as any).letter === "string"
    )
  );
}
