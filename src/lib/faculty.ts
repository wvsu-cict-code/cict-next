import type { Tables } from "@/lib/supabase/database.types";

export const PLACEHOLDER_IMAGE = "/Faculty_pics/sample.svg";

export interface FacultyMember {
  name: string;
  title: string;
  description: string;
  image: string;
}

export interface Department {
  slug: string;
  name: string;
  side: "left" | "right";
  y: number;
  x: number;
  link: string;
  logoAnchor: {
    x: number;
    y: number;
  };
  zoomScale: number;
}

export function toDepartment(row: Tables<"departments">): Department {
  return {
    slug: row.slug,
    name: row.name,
    side: row.side === "right" ? "right" : "left",
    x: Number(row.x),
    y: Number(row.y),
    link: `/faculty-profiles/${row.slug}`,
    logoAnchor: {
      x: Number(row.logo_anchor_x),
      y: Number(row.logo_anchor_y),
    },
    zoomScale: Number(row.zoom_scale),
  };
}

export function toFacultyMember(row: Tables<"faculty_members">): FacultyMember {
  return {
    name: row.name,
    title: row.title,
    description: row.description,
    image: row.image_url || PLACEHOLDER_IMAGE,
  };
}
