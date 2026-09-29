const AVATAR_COLORS = [
  "#8b2151",
  "#4338ca",
  "#0e7490",
  "#b45309",
  "#7e22ce",
  "#0f766e",
  "#be123c",
  "#4d7c0f",
];

/** Stable hash so a given author/category always gets the same colour. */
const hash = (value: string) => {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) {
    total = (total * 31 + value.charCodeAt(i)) % 100000;
  }
  return total;
};

export const authorInitials = (author: string) => {
  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

export const authorColor = (author: string) =>
  AVATAR_COLORS[hash(author) % AVATAR_COLORS.length];

/** Maps a category name onto one of the .post-label.c0–c5 colour tones. */
export const labelTone = (category: string) => hash(category) % 6;

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Estimated reading time, word count / 200 (PRD §39). */
export const readingTime = (html: string) => {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};
