import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import BlogCard from "../components/public/BlogCard";
import Footer from "../components/public/Footer";
import { categoriesOf, usePublicBlogs } from "../hooks/usePublicBlogs";

type Sort = "latest" | "oldest" | "az";

const SORTS: { value: Sort; label: string }[] = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A–Z" },
];

/** PRD §59 — two full rows of the 3-up grid. */
const PAGE_SIZE = 6;

export default function BlogList() {
  const { data, loading, error, refetch } = usePublicBlogs();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("latest");
  const [page, setPage] = useState(1);

  // Tag links from the article page deep-link into a filtered listing.
  const tag = params.get("tag") ?? "";
  const category = params.get("category") ?? "all";

  useEffect(() => {
    const fromUrl = params.get("q");
    if (fromUrl) setQuery(fromUrl);
  }, [params]);

  const posts = useMemo(() => data ?? [], [data]);
  const categories = useMemo(() => categoriesOf(posts), [posts]);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const matched = posts.filter((post) => {
      // PRD §35 — search title, description and tags.
      const matchesQuery =
        !q ||
        [post.title, post.description, post.category, ...post.tags].some((field) =>
          field.toLowerCase().includes(q)
        );
      const matchesCategory =
        category === "all" || post.category === category;
      const matchesTag = !tag || post.tags.some((t) => t === tag);
      return matchesQuery && matchesCategory && matchesTag;
    });

    // PRD §60 — sorting.
    return [...matched].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
  }, [posts, q, category, tag, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp rather than trust `page`: narrowing a filter can strand the user on a
  // page that no longer exists.
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // Any change to search, category, tag or sort restarts at page 1.
  useEffect(() => {
    setPage(1);
  }, [q, category, tag, sort]);

  const setCategory = (name: string) => {
    const next = new URLSearchParams(params);
    if (name === "all") next.delete("category");
    else next.set("category", name);
    setParams(next, { replace: true });
  };

  const clearTag = () => {
    const next = new URLSearchParams(params);
    next.delete("tag");
    setParams(next, { replace: true });
  };

  return (
    <>
      <Navbar query={query} onQueryChange={setQuery} />

      <main className="section">
        <div className="container">
          <h1 className="section-title">All Blogs</h1>

          {tag && (
            <p className="hint" style={{ marginBottom: 12 }}>
              Showing posts tagged <strong>#{tag}</strong>{" "}
              <button
                type="button"
                className="link-btn"
                onClick={clearTag}
              >
                Clear
              </button>
            </p>
          )}

          <div className="list-controls">
            {categories.length > 0 ? (
              <div className="chips">
                <button
                  className={`chip${category === "all" ? " active" : ""}`}
                  onClick={() => setCategory("all")}
                  aria-pressed={category === "all"}
                >
                  All
                </button>
                {categories.map((name) => (
                  <button
                    key={name}
                    className={`chip${category === name ? " active" : ""}`}
                    onClick={() => setCategory(name)}
                    aria-pressed={category === name}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}

            <select
              className="select"
              value={sort}
              aria-label="Sort blogs"
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="empty-state">Loading blogs...</p>
          ) : error ? (
            <div className="empty-state">
              <h3>Could not load blogs.</h3>
              <p>{error}</p>
              <button
                type="button"
                className="btn-subscribe"
                onClick={refetch}
              >
                Try again
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="posts-grid">
                {visible.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <p className="result-count">
                Showing {visible.length} of {filtered.length} published blogs
              </p>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Blog list pages">
                  <button
                    type="button"
                    className="page-btn"
                    disabled={current === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        className={`page-btn${n === current ? " active" : ""}`}
                        aria-current={n === current ? "page" : undefined}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="page-btn"
                    disabled={current === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h3>No blogs found.</h3>
              <p>Try a different search term or category.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
