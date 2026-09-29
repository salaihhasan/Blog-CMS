import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import ConfirmModal from "../../components/admin/ConfirmModal";
import TextEditor from "../../components/admin/TextEditor";
import ArticleBody from "../../components/public/ArticleBody";
import { useToast } from "../../components/admin/Toast";
import { errorMessage } from "../../hooks/useApi";
import {
  clearAutosave,
  useAutosave,
  type AutosavedDraft,
} from "../../hooks/useAutosave";
import { ApiError, blogsApi, categoriesApi } from "../../services/api";
import { useAdmin } from "../../hooks/useAdmin";
import type { Blog, BlogStatus, Category } from "../../types/blog";
import { formatDate } from "../../utils/blog";
import { fileToDataUri } from "../../utils/image";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface EditorState {
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string;
  status: BlogStatus;
}

const emptyState: EditorState = {
  title: "",
  description: "",
  content: "",
  thumbnail: "",
  category: "",
  tags: "",
  status: "draft",
};

/**
 * When a `.md` file is uploaded, prefill the title from its first `# heading`
 * so the admin does not have to retype it.
 */
const titleFromMarkdown = (markdown: string) => {
  const heading = markdown
    .split("\n")
    .find((line) => /^#\s+\S/.test(line))
    ?.replace(/^#\s+/, "")
    .trim();
  return heading && heading.length >= 5 ? heading : undefined;
};

interface BlogFormProps {
  mode: "create" | "edit";
  /** Required in edit mode — fetched via `GET /api/blogs/:id`. */
  id?: string;
}

const toForm = (blog: Blog): EditorState => ({
  title: blog.title,
  description: blog.description,
  content: blog.content,
  thumbnail: blog.thumbnail,
  category: blog.category,
  tags: blog.tags.join(", "),
  status: blog.status,
});

export default function BlogForm({ mode, id }: BlogFormProps) {
  const navigate = useNavigate();
  // Resolved from the backend via the admin session, "Admin" until then.
  const { name: adminName } = useAdmin();
  const [form, setForm] = useState<EditorState>(emptyState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof EditorState, string>>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [confirmTrash, setConfirmTrash] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // PRD §66 — set once the admin actually edits a field, so the copy loaded
  // from the server is never mistaken for unsaved work.
  const [touched, setTouched] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show, node } = useToast();

  // Categories for the dropdown, plus the blog being edited.
  useEffect(() => {
    let active = true;

    categoriesApi
      .list()
      .then((list) => {
        if (active) setCategories(list);
      })
      .catch(() => {
        /* the select falls back to whatever the post already has */
      });

    if (mode === "edit" && id) {
      blogsApi
        .get(id)
        .then((blog) => {
          if (!active) return;
          setForm(toForm(blog));
          setCreatedAt(blog.createdAt);
        })
        .catch((err) => {
          if (active) setFormError(errorMessage(err, "Failed to load this post."));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [mode, id]);

  // Default the category once the list arrives in create mode.
  useEffect(() => {
    if (mode === "create" && !form.category && categories.length > 0) {
      setForm((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, form.category, mode]);

  const slug = useMemo(() => slugify(form.title), [form.title]);

  // PRD §66 — a localStorage mirror of the form, so a refresh, a crash or a
  // stray back-navigation cannot lose a half-written article.
  const draftForm = useMemo<Record<string, string>>(
    () => ({ ...form }),
    [form]
  );

  const onRestore = (draft: AutosavedDraft) => {
    const saved = draft.form;
    setForm((prev) => ({
      ...prev,
      title: saved.title ?? "",
      description: saved.description ?? "",
      content: saved.content ?? "",
      thumbnail: saved.thumbnail ?? "",
      category: saved.category ?? prev.category,
      tags: saved.tags ?? "",
      status: saved.status === "published" ? "published" : "draft",
    }));
    setErrors({});
    setTouched(true);
    show("Draft restored.");
  };

  const onDiscard = () => {
    setErrors({});
    // Create mode starts blank again. Edit mode keeps the post it already has
    // from the server — blanking it would throw away valid content.
    if (mode === "create")
      setForm((prev) => ({ ...emptyState, category: prev.category }));
  };

  const { savedAt, recovered, restore, discard } = useAutosave(
    draftForm,
    touched && !loading,
    onRestore,
    onDiscard
  );

  /** Unsaved state shaped like a Blog so the preview can render it. */
  const previewPost: Blog = {
    id: id ?? "preview",
    title: form.title || "Untitled post",
    slug: slug || "untitled-post",
    description: form.description,
    content: form.content,
    thumbnail: form.thumbnail,
    category: form.category || "Uncategorised",
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: form.status,
    createdAt: createdAt ?? new Date().toISOString(),
    updatedAt: createdAt ?? new Date().toISOString(),
    author: adminName,
  };

  const set = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setTouched(true);
  };

  const validate = (status: BlogStatus) => {
    const next: Partial<Record<keyof EditorState, string>> = {};
    if (form.title.trim().length < 5)
      next.title = "Title must be at least 5 characters";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.content.trim()) next.content = "Content is required";
    if (!form.category.trim()) next.category = "Category is required";
    if (status === "published" && !form.thumbnail.trim())
      next.thumbnail = "A featured image is required to publish";
    if (!slug) next.title = "Title must contain letters or numbers for the URL";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (status: BlogStatus) => {
    if (saving) return;
    setForm((prev) => ({ ...prev, status }));
    if (!validate(status)) {
      show("Please fix the highlighted fields.", "error");
      return;
    }

    setSaving(true);
    setFormError("");

    // `slug` and `author` are required by the Blog model, so both are always sent.
    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description.trim(),
      content: form.content,
      thumbnail: form.thumbnail,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      author: adminName,
    };

    try {
      if (mode === "edit" && id) {
        await blogsApi.update(id, payload);
        show("Post updated successfully.");
      } else {
        await blogsApi.create(payload);
        show(
          status === "published"
            ? "Post published successfully."
              : "Draft saved successfully."
        );
      }
      // The work is on the server now — the local copy would only offer to
      // "restore" it on the next visit.
      clearAutosave();
      navigate("/admin/blogs");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Token expired or missing — drop the dead session.
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        show("Your session expired. Please sign in again.", "error");
        navigate("/admin/login", { replace: true });
        return;
      }
      setFormError(errorMessage(err, "Failed to save the post."));
      show("Failed to save the post.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onMarkdownLoaded = (markdown: string) => {
    const heading = titleFromMarkdown(markdown);
    if (heading) {
      set("title", heading);
      show("Markdown imported. Title filled from the first heading.");
    } else {
      show("Markdown imported into the editor.", "success");
    }
  };

  const onPickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Stored as a data URI so the image survives a refresh — see utils/image.ts
    const result = await fileToDataUri(file);
    if (!result.ok) {
      show(result.error, "error");
      return;
    }
    set("thumbnail", result.dataUri);
  };

  const remove = async () => {
    if (!id || deleting) return;
    setDeleting(true);
    try {
      await blogsApi.remove(id);
      show("Post deleted successfully.");
      navigate("/admin/blogs");
    } catch (err) {
      show(errorMessage(err, "Failed to delete the post."), "error");
      setDeleting(false);
      setConfirmTrash(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void save(form.status);
  };

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ color: "var(--muted)" }}>Loading post...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {mode === "create" ? "Create Post" : "Edit Post"}
          </h1>
          <p className="page-sub">
            {mode === "create"
              ? "Draft a new article and publish when it is ready."
              : "Update the content and publishing settings for this post."}
          </p>
        </div>
      </div>

      {formError && (
        <div className="alert error" role="alert">
          {formError}
        </div>
      )}

      {recovered && (
        <div className="alert info" role="status">
          <span>
            Unsaved draft from{" "}
            {new Date(recovered.at).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            was found on this device.
          </span>
          <span className="alert-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={restore}
            >
              Restore
            </button>
            <button
              type="button"
              className="btn btn-soft btn-sm"
              onClick={discard}
            >
              Discard
            </button>
          </span>
        </div>
      )}

      <form className="editor-split" onSubmit={onSubmit} noValidate>
        <div>
          <section className="card">
            <div className="field">
              <label className="label" htmlFor="post-title">
                Post title
              </label>
              <input
                id="post-title"
                className="input"
                value={form.title}
                placeholder="Enter a clear, descriptive title"
                onChange={(e) => set("title", e.target.value)}
                aria-invalid={errors.title ? true : undefined}
              />
              {errors.title && <p className="hint err">{errors.title}</p>}
              <p className="hint">
                Public URL: /blog/{slug || "your-post-slug"}
              </p>
            </div>

            <div className="field">
              <label className="label" htmlFor="post-desc">
                Short description
              </label>
              <textarea
                id="post-desc"
                className="textarea"
                style={{ minHeight: 72 }}
                value={form.description}
                placeholder="One or two sentences used on cards and search results"
                onChange={(e) => set("description", e.target.value)}
                aria-invalid={errors.description ? true : undefined}
              />
              {errors.description && (
                <p className="hint err">{errors.description}</p>
              )}
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label" htmlFor="post-category">
                  Category
                </label>
                <select
                  id="post-category"
                  className="select"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="hint err">{errors.category}</p>}
              </div>

              <div className="field">
                <label className="label" htmlFor="post-tags">
                  Tags (comma separated)
                </label>
                <input
                  id="post-tags"
                  className="input"
                  value={form.tags}
                  placeholder="node, graphql, api"
                  onChange={(e) => set("tags", e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Featured image</label>
              {form.thumbnail ? (
                <div className="img-preview">
                  <img src={form.thumbnail} alt="" />
                  <div className="img-preview-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => set("thumbnail", "")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload Image
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onPickImage}
              />
              {errors.thumbnail && (
                <p className="hint err">{errors.thumbnail}</p>
              )}
            </div>
          </section>

          <section className="card">
            <TextEditor
              value={form.content}
              onChange={(html) => set("content", html)}
              onMarkdownLoaded={onMarkdownLoaded}
              error={errors.content}
            />
          </section>
        </div>

        <aside className="card">
          <div className="card-title">Publish Settings</div>
          <div className="publish-row">
            <span className="publish-key">Status</span>
            <span className={`badge badge-${form.status}`}>
              {form.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <div className="publish-row">
            <span className="publish-key">Visibility</span>
            <span className="publish-val">Public</span>
          </div>
          <div className="publish-row">
            <span className="publish-key">Publish date</span>
            <span className="publish-val">
              {createdAt ? formatDate(createdAt) : "Immediately"}
            </span>
          </div>

          {savedAt && (
            <p className="autosave-note">
              Draft saved{" "}
              {new Date(savedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          <div className="publish-actions">
            <button
              type="button"
              className="btn btn-soft btn-block"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={saving}
              onClick={() => void save("published")}
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Publish Post"
                  : "Update Post"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              disabled={saving}
              onClick={() => void save("draft")}
            >
              Save as Draft
            </button>
            {mode === "edit" && (
              <button
                type="button"
                className="btn btn-danger-outline btn-block"
                disabled={deleting}
                onClick={() => setConfirmTrash(true)}
              >
                Delete Post
              </button>
            )}
          </div>
        </aside>
      </form>

      <ConfirmModal
        open={confirmTrash}
        title="Delete this post?"
        message="The post will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => void remove()}
        onCancel={() => setConfirmTrash(false)}
      />

      {previewOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Post preview"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Preview</div>
            <div className="preview-scroll">
              <article className="article">
                <ArticleBody post={previewPost} />
              </article>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {node}
    </AdminLayout>
  );
}
