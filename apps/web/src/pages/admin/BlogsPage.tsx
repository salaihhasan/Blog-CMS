import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { useToast } from "../../components/admin/Toast";
import {
  IconEdit,
  IconPlus,
  IconPosts,
  IconSearch,
  IconTrash,
} from "../../components/admin/icons";
import { errorMessage, useApi } from "../../hooks/useApi";
import { blogsApi, categoriesApi } from "../../services/api";
import type { Blog, BlogStatus } from "../../types/blog";
import { formatDate } from "../../utils/blog";

const PAGE_SIZE = 5;

const statusLabel: Record<BlogStatus, string> = {
  published: "Published",
  draft: "Draft",
};

export default function BlogsPage() {
  const { data, loading, error, refetch, setData } = useApi<Blog[]>(
    () => blogsApi.list(),
    []
  );
  const categories = useApi(() => categoriesApi.list(), []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BlogStatus>("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Blog | null>(null);
  const navigate = useNavigate();
  const { show, node } = useToast();

  const blogs = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesQuery =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.description.toLowerCase().includes(q);
      const matchesStatus = status === "all" || blog.status === status;
      const matchesCategory = category === "all" || blog.category === category;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [blogs, query, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await blogsApi.remove(pendingDelete.id);
      setData(blogs.filter((b) => b.id !== pendingDelete.id));
      show("Blog deleted successfully.");
    } catch (err) {
      show(errorMessage(err, "Failed to delete the blog."), "error");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Blog Posts</h1>
          <p className="page-sub">Create, edit and publish your articles.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/admin/blogs/create")}
          >
            <IconPlus size={16} />
            Create Post
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <IconSearch size={15} />
          <input
            type="search"
            placeholder="Search post titles..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Search post titles"
          />
        </div>

        <div className="page-actions">
          <select
            className="toolbar-select"
            value={status}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatus(e.target.value as "all" | BlogStatus);
              setPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            className="toolbar-select"
            value={category}
            aria-label="Filter by category"
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="card">
        {loading ? (
          <p className="card-desc" style={{ padding: "28px 4px" }}>
            Loading blog posts...
          </p>
        ) : error ? (
          <div className="empty-state">
            <h3>Could not load your posts.</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={refetch}
            >
              Try again
            </button>
          </div>
        ) : visible.length > 0 ? (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((blog) => (
                    <tr key={blog.id}>
                      <td className="cell-strong">{blog.title}</td>
                      <td style={{ color: "var(--muted)" }}>{blog.category}</td>
                      <td>
                        <span className={`badge badge-${blog.status}`}>
                          {statusLabel[blog.status]}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {formatDate(blog.createdAt)}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`Edit ${blog.title}`}
                            onClick={() =>
                              navigate(`/admin/blogs/edit/${blog.id}`)
                            }
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            aria-label={`Delete ${blog.title}`}
                            disabled={deleting}
                            onClick={() => setPendingDelete(blog)}
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

            <div className="table-foot">
              <span className="table-count">
                Showing {visible.length} of {filtered.length} blog posts
              </span>
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  disabled={current === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`page-btn${n === current ? " active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-btn"
                  disabled={current === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span className="stat-icon" style={{ margin: "0 auto 12px" }}>
              <IconPosts size={16} />
            </span>
            <h3>No blogs found.</h3>
            <p>Try a different filter, or create your first blog.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/admin/blogs/create")}
            >
              <IconPlus size={16} />
              Create Post
            </button>
          </div>
        )}
      </section>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete this blog?"
        message={`"${pendingDelete?.title}" will be permanently removed. This action cannot be undone.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      {node}
    </AdminLayout>
  );
}
