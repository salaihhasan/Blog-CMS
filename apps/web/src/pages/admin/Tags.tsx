import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import {
  IconPosts,
  IconSearch,
  IconTag,
} from "../../components/admin/icons";
import { useApi } from "../../hooks/useApi";
import { blogsApi } from "../../services/api";
import type { Blog } from "../../types/blog";
import { formatDate } from "../../utils/blog";

interface TagUsage {
  tag: string;
  count: number;
  published: number;
  latest: string | null;
  posts: Blog[];
}

/**
 * Tags live as a string array on each blog document, so there is no separate
 * tag resource to CRUD. This page is therefore an inventory built from the
 * real blog list: which tags exist, how often they are used, and which posts
 * use them. Editing a tag means editing the post that carries it.
 */
export default function Tags() {
  const { data, loading, error, refetch } = useApi<Blog[]>(
    () => blogsApi.list(),
    []
  );
  const [query, setQuery] = useState("");

  const blogs = useMemo(() => data ?? [], [data]);

  const usage = useMemo<TagUsage[]>(() => {
    const map = new Map<string, TagUsage>();

    for (const blog of blogs) {
      for (const raw of blog.tags) {
        const tag = raw.trim();
        if (!tag) continue;
        const existing = map.get(tag) ?? {
          tag,
          count: 0,
          published: 0,
          latest: null,
          posts: [],
        };
        existing.count += 1;
        if (blog.status === "published") existing.published += 1;
        if (!existing.latest || blog.createdAt > existing.latest) {
          existing.latest = blog.createdAt;
        }
        existing.posts.push(blog);
        map.set(tag, existing);
      }
    }

    return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [blogs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? usage.filter((t) => t.tag.toLowerCase().includes(q)) : usage;
  }, [usage, query]);

  const totalAssignments = usage.reduce((sum, t) => sum + t.count, 0);

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Tags</h1>
          <p className="page-sub">
            Every tag in use across your posts, derived from the blog list.
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-outline" to="/admin/blogs/create">
            <IconTag size={15} />
            Add tags to a post
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert error" role="alert">
          {error}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={refetch}
          >
            Retry
          </button>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Unique tags</div>
            <div className="stat-value">{loading ? "—" : usage.length}</div>
          </div>
          <span className="stat-icon">
            <IconTag size={16} />
          </span>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Tag assignments</div>
            <div className="stat-value">{loading ? "—" : totalAssignments}</div>
          </div>
          <span className="stat-icon">
            <IconPosts size={16} />
          </span>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <div className="card-title">All Tags</div>
            <div className="card-desc">
              {visible.length} of {usage.length} tags
            </div>
          </div>
          <div className="search-box">
            <IconSearch size={15} />
            <input
              type="search"
              placeholder="Search tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tags"
            />
          </div>
        </div>

        {loading ? (
          <p className="card-desc" style={{ padding: "20px 4px" }}>
            Loading tags...
          </p>
        ) : visible.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Posts</th>
                  <th>Published</th>
                  <th>Last used</th>
                  <th style={{ textAlign: "right" }}>Posts using it</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ tag, count, published, latest, posts }) => (
                  <tr key={tag}>
                    <td className="cell-strong">#{tag}</td>
                    <td>{count}</td>
                    <td>
                      <span className="badge badge-published">{published}</span>
                    </td>
                    <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {latest ? formatDate(latest) : "—"}
                    </td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                        {posts.slice(0, 3).map((post) => (
                          <Link
                            key={post.id}
                            className="icon-btn"
                            aria-label={`Edit ${post.title}`}
                            title={post.title}
                            to={`/admin/blogs/edit/${post.id}`}
                          >
                            <IconPosts size={15} />
                          </Link>
                        ))}
                        {posts.length > 3 && (
                          <span style={{ color: "var(--muted)" }}>
                            +{posts.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No tags yet.</h3>
            <p>
              Add comma-separated tags when creating or editing a post and they
              will show up here.
            </p>
            <Link className="btn btn-primary" to="/admin/blogs/create">
              Create Post
            </Link>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
