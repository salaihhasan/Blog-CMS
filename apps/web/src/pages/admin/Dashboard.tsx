import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import {
  IconArchive,
  IconCheck,
  IconClock,
  IconFolder,
} from "../../components/admin/icons";
import { useApi } from "../../hooks/useApi";
import { blogsApi, categoriesApi } from "../../services/api";
import { useAdmin } from "../../hooks/useAdmin";
import { formatDate } from "../../utils/blog";

export default function Dashboard() {
  const { name: adminName } = useAdmin();
  const blogs = useApi(() => blogsApi.list(), []);
  const categories = useApi(() => categoriesApi.list(), []);

  const all = blogs.data ?? [];
  const stats = [
    { label: "Total blogs", value: all.length, Icon: IconFolder },
    {
      label: "Published",
      value: all.filter((b) => b.status === "published").length,
      Icon: IconCheck,
    },
    {
      label: "Drafts",
      value: all.filter((b) => b.status === "draft").length,
      Icon: IconClock,
    },
    {
      label: "Categories",
      value: categories.data?.length ?? 0,
      Icon: IconArchive,
    },
  ];

  const recent = all.slice(0, 4);

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            Welcome back, {adminName}. Here is what is happening.
          </p>
        </div>
      </div>

      {blogs.error && (
        <div className="alert error" role="alert">
          {blogs.error}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={blogs.refetch}
          >
            Retry
          </button>
        </div>
      )}

      <div className="stat-grid">
        {stats.map(({ label, value, Icon }) => (
          <div className="stat-card" key={label}>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">
                {blogs.loading || categories.loading ? "—" : value}
              </div>
            </div>
            <span className="stat-icon">
              <Icon size={16} />
            </span>
          </div>
        ))}
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Recent posts</div>
            <div className="card-desc">The latest activity across your blog.</div>
          </div>
          <Link className="btn btn-outline btn-sm" to="/admin/blogs">
            View all
          </Link>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {blogs.loading ? (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>
                    Loading posts...
                  </td>
                </tr>
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>
                    No posts yet.
                  </td>
                </tr>
              ) : (
                recent.map((blog) => (
                  <tr key={blog.id}>
                    <td className="cell-strong">
                      <Link to={`/admin/blogs/edit/${blog.id}`}>{blog.title}</Link>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{blog.category}</td>
                    <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {formatDate(blog.createdAt)}
                    </td>
                    <td>
                      <span className={`badge badge-${blog.status}`}>
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
