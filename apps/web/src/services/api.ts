/**
 * Typed client for the backend API.
 *
 * Every endpoint keeps its own full path so the auth routes under
 * `/api/admin` are never confused with the resource routes under
 * `/api/blogs` and `/api/categories`.
 *
 * Responses follow the envelope defined in the PRD (§51):
 *   success: { success: true, message: string, data: T }
 *   failure: { success: false, message: string }
 * `request` unwraps `data` and throws `ApiError` on anything else.
 */

import type { Blog, Category } from "../types/blog";

const BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5001"
).replace(/\/+$/, "");

export const TOKEN_KEY = "token";
export const AUTH_KEY = "isAuthenticated";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Send the stored JWT. Defaults to true; public routes opt out. */
  auth?: boolean;
  body?: unknown;
}

async function request<T>(
  path: string,
  { auth = true, body, headers, ...init }: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  // 204 and empty bodies are valid for DELETE.
  const payload = await response
    .json()
    .catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status
    );
  }

  return payload?.data as T;
}

/* ------------------------------------------------------------------ */
/* Response normalisation                                               */
/* ------------------------------------------------------------------ */

/**
 * Mongoose documents serialise with `_id`, not `id`. The UI consistently
 * addresses records by `id`, so rewrite the key once here instead of
 * scattering `_id` fallbacks across every component.
 */
type WithMongoId<T> = Omit<T, "id"> & { _id?: string; id?: string };

const withId = <T extends { id: string }>(record: WithMongoId<T>): T => {
  const { _id, ...rest } = record;
  return { ...rest, id: rest.id ?? _id ?? "" } as T;
};

const withIdList = <T extends { id: string }>(records: WithMongoId<T>[]) =>
  Array.isArray(records) ? records.map(withId) : [];

/* ------------------------------------------------------------------ */
/* Authentication — /api/admin                                         */
/* ------------------------------------------------------------------ */

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

/**
 * The backend currently returns `{ token }` with no admin object. It is being
 * changed to include one, so `admin` is optional here: when it starts arriving
 * the UI picks it up with no further frontend change.
 */
export interface AuthResult {
  token: string;
  admin?: AdminUser;
}

export const authApi = {
  /**
   * NOTE: `registerAdmin` responds with `{ message, data: { id, name, email } }`
   * and no `success` flag. It does **not** issue a token, so callers must
   * follow up with `login` to obtain one.
   */
  register: (input: RegisterInput) =>
    request<AdminUser>("/api/admin/register", {
      auth: false,
      method: "POST",
      body: input,
    }),

  login: (input: LoginInput) =>
    request<AuthResult>("/api/admin/login", {
      auth: false,
      method: "POST",
      body: input,
    }),

  /**
   * Used to resolve the signed-in admin's name once the backend returns one.
   * Tolerates both a bare `{ message }` body and an envelope carrying the user.
   */
  profile: () =>
    request<{ message?: string; admin?: AdminUser; user?: AdminUser }>(
      "/api/admin/profile"
    ),
};

/* ------------------------------------------------------------------ */
/* Blogs — /api/blogs                                                   */
/* ------------------------------------------------------------------ */

/** Everything the client is allowed to send when writing a blog. */
export type BlogInput = Pick<
  Blog,
  | "title"
  | "slug"
  | "description"
  | "content"
  | "thumbnail"
  | "category"
  | "tags"
  | "status"
  | "author"
>;

export type BlogUpdate = Partial<BlogInput>;

export const blogsApi = {
  /** All blogs, drafts included. Admin only. */
  list: async () => withIdList(await request<WithMongoId<Blog>[]>("/api/blogs")),

  get: async (id: string) =>
    withId(await request<WithMongoId<Blog>>(`/api/blogs/${id}`)),

  create: async (input: BlogInput) =>
    withId(
      await request<WithMongoId<Blog>>("/api/blogs", {
        method: "POST",
        body: input,
      })
    ),

  update: async (id: string, input: BlogUpdate) =>
    withId(
      await request<WithMongoId<Blog>>(`/api/blogs/${id}`, {
        method: "PUT",
        body: input,
      })
    ),

  remove: (id: string) =>
    request<null>(`/api/blogs/${id}`, { method: "DELETE" }),

  /** Published blogs only. No JWT. */
  listPublic: async () =>
    withIdList(
      await request<WithMongoId<Blog>[]>("/api/blogs/public", { auth: false })
    ),
};

/* ------------------------------------------------------------------ */
/* Categories — /api/categories                                         */
/* ------------------------------------------------------------------ */

export type CategoryInput = Pick<Category, "name" | "slug">;
export type CategoryUpdate = Partial<CategoryInput>;

export const categoriesApi = {
  list: async () =>
    withIdList(await request<WithMongoId<Category>[]>("/api/categories")),

  create: async (input: CategoryInput) =>
    withId(
      await request<WithMongoId<Category>>("/api/categories", {
        method: "POST",
        body: input,
      })
    ),

  update: async (id: string, input: CategoryUpdate) =>
    withId(
      await request<WithMongoId<Category>>(`/api/categories/${id}`, {
        method: "PUT",
        body: input,
      })
    ),

  remove: (id: string) =>
    request<null>(`/api/categories/${id}`, { method: "DELETE" }),
};

/* ------------------------------------------------------------------ */
/* Session helpers                                                      */
/* ------------------------------------------------------------------ */

const NAME_KEY = "adminName";
const EMAIL_KEY = "adminEmail";

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
};

/**
 * Stores the session. If the login response carried the admin object, the
 * identity is cached so the UI can show it immediately; otherwise the address
 * the admin signed in with is remembered as a partial fallback.
 */
export const saveSession = ({ token, admin }: AuthResult, signedInAs?: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(AUTH_KEY, "true");

  if (admin?.name) localStorage.setItem(NAME_KEY, admin.name);
  else if (!localStorage.getItem(NAME_KEY))
    localStorage.setItem(NAME_KEY, "Admin");

  if (admin?.email) localStorage.setItem(EMAIL_KEY, admin.email);
  else if (signedInAs && !localStorage.getItem(EMAIL_KEY))
    localStorage.setItem(EMAIL_KEY, signedInAs);
};

/** Display name, falling back to a generic label until the backend sends one. */
export const getAdminName = () => localStorage.getItem(NAME_KEY) ?? "Admin";

/** The address the admin signed in with, or that the backend reported. */
export const getAdminEmail = () => localStorage.getItem(EMAIL_KEY) ?? "";

/**
 * Route guard check. Requires a real token — the previous `AUTH_KEY`-only
 * check let anyone past the guard by flipping one localStorage value.
 */
export const hasToken = () => localStorage.getItem(TOKEN_KEY) !== null;
