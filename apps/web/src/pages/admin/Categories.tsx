import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { useToast } from "../../components/admin/Toast";
import {
  IconEdit,
  IconFolder,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../../components/admin/icons";
import { errorMessage } from "../../hooks/useApi";
import { blogsApi, categoriesApi } from "../../services/api";
import type { Blog, Category } from "../../types/blog";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const { show, node } = useToast();

  const load = () => {
    setLoading(true);
    setLoadError("");
    Promise.all([categoriesApi.list(), blogsApi.list()])
      .then(([cats, allBlogs]) => {
        setCategories(cats);
        setBlogs(allBlogs);
        setSelectedId((prev) => prev ?? cats[0]?.id ?? null);
      })
      .catch((err) => setLoadError(errorMessage(err, "Failed to load categories.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /** The Category model has no post counter, so derive it from the blogs. */
  const postCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const blog of blogs) {
      counts.set(blog.category, (counts.get(blog.category) ?? 0) + 1);
    }
    return counts;
  }, [blogs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? categories.filter((c) => c.name.toLowerCase().includes(q))
      : categories;
  }, [categories, query]);

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  const openCreate = () => {
    setEditingId(null);
    setDraftName("");
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setDraftName(category.name);
    setShowForm(true);
  };

  const saveCategory = async () => {
    if (saving) return;
    const name = draftName.trim();

    if (name.length < 2) {
      show("Category name must be at least 2 characters.", "error");
      return;
    }

    const slug = slugify(name);
    if (!slug) {
      show("Category name must contain letters or numbers.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updated = await categoriesApi.update(editingId, { name, slug });
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        show("Category updated successfully.");
      } else {
        const created = await categoriesApi.create({ name, slug });
        setCategories((prev) => [created, ...prev]);
        setSelectedId(created.id);
        show("Category created successfully.");
      }
      setShowForm(false);
      setDraftName("");
      setEditingId(null);
    } catch (err) {
      // 409 is returned when the name or slug is already taken.
      show(errorMessage(err, "Failed to save the category."), "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await categoriesApi.remove(target.id);
      const next = categories.filter((c) => c.id !== target.id);
      setCategories(next);
      if (selectedId === target.id) setSelectedId(next[0]?.id ?? null);
      show("Category deleted successfully.");
    } catch (err) {
      show(errorMessage(err, "Failed to delete the category."), "error");
    }
  };

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">Create and organise the categories posts belong to.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
            disabled={loading}
          >
            <IconPlus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {loadError && (
        <div className="alert error" role="alert">
          {loadError}
          <button type="button" className="btn btn-outline btn-sm" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total categories</div>
            <div className="stat-value">{loading ? "—" : categories.length}</div>
          </div>
          <span className="stat-icon">
            <IconFolder size={16} />
          </span>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Categories in use</div>
            <div className="stat-value">
              {loading ? "—" : postCount.size}
            </div>
          </div>
          <span className="stat-icon">
            <IconFolder size={16} />
          </span>
        </div>
      </div>

      <div className="split">
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">All Categories</div>
              <div className="card-desc">
                {visible.length} of {categories.length} categories
              </div>
            </div>
            <div className="search-box">
              <IconSearch size={15} />
              <input
                type="search"
                placeholder="Search categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search categories"
              />
            </div>
          </div>

          {loading ? (
            <p className="card-desc" style={{ padding: "20px 4px" }}>
              Loading categories...
            </p>
          ) : visible.length > 0 ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Posts</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((category) => (
                    <tr
                      key={category.id}
                      className={category.id === selected?.id ? "selected" : ""}
                      onClick={() => setSelectedId(category.id)}
                    >
                      <td>
                        <div className="cell-media">
                          <span className="tile">
                            <IconFolder size={15} />
                          </span>
                          <div>
                            <div className="cell-strong">{category.name}</div>
                            <span className="cell-sub">/{category.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>{postCount.get(category.name) ?? 0}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`Edit ${category.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(category);
                            }}
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            aria-label={`Delete ${category.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete(category);
                            }}
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No categories found.</h3>
              <p>Try a different search, or add a new category.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreate}
              >
                <IconPlus size={16} />
                Add Category
              </button>
            </div>
          )}
        </section>

        <aside className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Category Details</div>
              <div className="card-desc">Currently selected node</div>
            </div>
          </div>

          {selected ? (
            <>
              <div className="detail-kv">
                <div className="detail-key">Category name</div>
                <div className="detail-val">{selected.name}</div>
              </div>
              <div className="detail-kv">
                <div className="detail-key">Slug</div>
                <div className="detail-val">{selected.slug}</div>
              </div>
              <div className="detail-kv">
                <div className="detail-key">Posts</div>
                <div className="detail-val">
                  {postCount.get(selected.name) ?? 0}
                </div>
              </div>
              <div className="detail-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => openEdit(selected)}
                >
                  <IconEdit size={15} />
                  Edit Category
                </button>
              </div>
            </>
          ) : (
            <p className="card-desc">Select a category to see its details.</p>
          )}
        </aside>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? "Edit category" : "Add category"}
          onClick={() => setShowForm(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {editingId ? "Edit Category" : "Add Category"}
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="field">
                <label className="label" htmlFor="cat-name">
                  Category name
                </label>
                <input
                  id="cat-name"
                  className="input"
                  value={draftName}
                  placeholder="e.g. Design Systems"
                  onChange={(e) => setDraftName(e.target.value)}
                  autoFocus
                />
                <p className="hint">
                  Slug: {slugify(draftName) || "your-category-slug"}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={() => void saveCategory()}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete this category?"
        message={`"${pendingDelete?.name}" will be removed. Posts already using it keep their category name.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      {node}
    </AdminLayout>
  );
}
