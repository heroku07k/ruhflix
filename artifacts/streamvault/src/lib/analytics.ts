declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

function track(event: string, params?: Record<string, unknown>) {
  try { window.gtag?.("event", event, params); } catch {}
}

export const Analytics = {
  profileCreated: () =>
    track("profile_created"),

  profileSelected: () =>
    track("profile_selected"),

  videoStart: (title: string, contentType: string, id: string) =>
    track("video_start", { content_title: title, content_type: contentType, content_id: id }),

  videoServerSwitch: (label: string) =>
    track("video_server_switch", { server_label: label }),

  search: (query: string) =>
    track("search", { search_term: query }),

  addToList: (title: string) =>
    track("add_to_list", { content_title: title }),

  liked: (title: string) =>
    track("liked_content", { content_title: title }),
};
