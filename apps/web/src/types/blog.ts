export type BlogStatus = "draft" | "published";

/**
 * Shape of a single blog as returned by the backend.
 * Mirrors the `data` item of the blogs API response envelope.
 */
export interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
}

/** Envelope wrapped around every backend response (PRD §51). */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
