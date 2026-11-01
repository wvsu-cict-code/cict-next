import type { StudentWork } from "@/lib/cms/content";

export function makeWork(overrides: Partial<StudentWork> = {}): StudentWork {
  return {
    id: "w1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    title: "Sunrise",
    student: "Ana Cruz",
    description: "",
    kind: "art",
    image_url: "https://cdn.test/sunrise.jpg",
    image_width: 800,
    image_height: 600,
    orientation: null,
    youtube_id: null,
    original_url: null,
    portfolio_url: null,
    store_url: null,
    zoom_url: null,
    zoom_width: null,
    zoom_height: null,
    sort_order: 0,
    visible: true,
    ...overrides,
  };
}
