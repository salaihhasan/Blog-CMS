import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import {
  IconImage,
  IconSearch,
} from "../../components/admin/icons";
import { useApi } from "../../hooks/useApi";
import { blogsApi } from "../../services/api";
import type { Blog } from "../../types/blog";

interface MediaItem {
  id: string;
  name: string;
  src: string;
  /** Where the image came from, so it is clear the library is derived. */
  origin: "thumbnail" | "inline";
  posts: Blog[];
  isDataUri: boolean;
}

const bytesLabel = (src: string) => {
  if (!src.startsWith("data:")) return "remote";
  // base64 inflates by ~4/3
  const approx = Math.round((src.length * 0.75) / 1024);
  return approx > 1024 ? `${(approx / 1024).toFixed(1)} MB` : `${approx} KB`;
};

/**
 * PRD §47 media library.
 *
 * There is no upload endpoint and no media collection, so rather than fake a
 * library with seeded rows this page inventories the images that actually
 * exist: every post thumbnail plus every inline image inside article content.
 * Deleting a post is what removes an image.
 */
export default function Media() {
  const { data, loading, error, refetch } = useApi<Blog[]>(
    () => blogsApi.list(),
    []
  );
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<"all" | MediaItem["origin"]>("all");

  const blogs = useMemo(() => data ?? [], [data]);

  const items = useMemo<MediaItem[]>(() => {
    const found = new Map<string, MediaItem>();

    const add = (src: string, name: string, blog: Blog, kind: MediaItem["origin"]) => {
      if (!src) return;
      const existing = found.get(src);
      if (existing) {
        if (!existing.posts.some((p) => p.id === blog.id)) {
          existing.posts.push(blog);
        }
        return;
      }
      found.set(src, {
        id: src.slice(0, 48),
        name,
        src,
        origin: kind,
        posts: [blog],
        isDataUri: src.startsWith("data:"),
      });
    };

    for (const blog of blogs) {
      add(blog.thumbnail, `${blog.slug}-thumb`, blog, "thumbnail");

      // Inline <img src="…"> inside the stored article HTML.
      const matches = blog.content.match(/<img[^>]+src="([^"]+)"/gi) ?? [];
      matches.forEach((tag, index) => {
        const src = /src="([^"]+)"/i.exec(tag)?.[1];
        if (src) add(src, `${blog.slug}-inline-${index + 1}`, blog, "inline");
      });
    }

    return [...found.values()];
  }, [blogs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesOrigin = origin === "all" || item.origin === origin;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.posts.some((p) => p.title.toLowerCase().includes(q));
      return matchesOrigin && matchesQuery;
    });
  }, [items, query, origin]);

  const embedded = items.filter((i) => i.isDataUri).length;

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Media</h1>
          <p className="page-sub">
            Images currently attached to your posts, collected from the blog
            list.
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-primary" to="/admin/blogs/create">
            <IconImage size={15} />
            Upload via a post
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
            <div className="stat-label">Images in use</div>
            <div className="stat-value">{loading ? "—" : items.length}</div>
          </div>
          <span className="stat-icon">
            <IconImage size={16} />
          </span>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Stored inline</div>
            <div className="stat-value">{loading ? "—" : embedded}</div>
          </div>
          <span className="stat-icon">
            <IconImage size={16} />
          </span>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Library</div>
            <div className="card-desc">
              {visible.length} of {items.length} images
            </div>
          </div>
          <div className="page-actions">
            <select
              className="toolbar-select"
              value={origin}
              aria-label="Filter by image source"
              onChange={(e) =>
                setOrigin(e.target.value as "all" | MediaItem["origin"])
              }
            >
              <option value="all">All sources</option>
              <option value="thumbnail">Thumbnails</option>
              <option value="inline">Inline images</option>
            </select>
            <div className="search-box">
              <IconSearch size={15} />
              <input
                type="search"
                placeholder="Search media..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search media"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="card-desc" style={{ padding: "20px 4px" }}>
            Loading media...
          </p>
        ) : visible.length > 0 ? (
          <div className="media-grid">
            {visible.map((item) => (
              <figure className="media-tile" key={item.id}>
                <div className="media-thumb">
                  <img
                    src={item.src}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                </div>
                <figcaption>
                  <div className="cell-strong" title={item.name}>
                    {item.name}
                  </div>
                  <div className="cell-sub">
                    {item.origin === "thumbnail" ? "Thumbnail" : "Inline"} ·{" "}
                    {bytesLabel(item.src)}
                  </div>
                  <div className="media-posts">
                    {item.posts.map((post) => (
                      <Link key={post.id} to={`/admin/blogs/edit/${post.id}`}>
                        {post.title}
                      </Link>
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No media found.</h3>
            <p>
              Upload a thumbnail or an inline image while writing a post and it
              will appear here.
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
