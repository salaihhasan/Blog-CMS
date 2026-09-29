import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import FeaturedHero from "../components/public/FeaturedHero";
import BlogCard from "../components/public/BlogCard";
import Footer from "../components/public/Footer";
import { categoriesOf, usePublicBlogs } from "../hooks/usePublicBlogs";

export default function Home() {
  const { data, loading, error, refetch } = usePublicBlogs();
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);

  const posts = useMemo(() => data ?? [], [data]);
  const categories = useMemo(() => categoriesOf(posts), [posts]);

  const q = query.trim().toLowerCase();

  // Search covers title, description and tags (PRD §35).
  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const matchesQuery =
          !q ||
          [post.title, post.description, post.category, ...post.tags].some((field) =>
            field.toLowerCase().includes(q)
          );
        const matchesCategory =
          activeCats.length === 0 || activeCats.includes(post.category);
        return matchesQuery && matchesCategory;
      }),
    [posts, q, activeCats]
  );

  const featured = posts[0] ?? null;

  // A category filter is scoped to one page at a time.
  useEffect(() => {
    setActiveCats([]);
  }, []);

  useEffect(() => {
    if (q) {
      document
        .getElementById("latest-posts")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [q]);

  const toggleCategory = (category: string) =>
    setActiveCats((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );

  return (
    <>
      <Navbar query={query} onQueryChange={setQuery} />

      {featured && !loading && <FeaturedHero post={featured} />}

      <section className="section" id="latest-posts">
        <div className="container">
          <h2 className="section-title">Latest Posts</h2>

          {loading ? (
            <p className="empty-state">Loading posts...</p>
          ) : error ? (
            <div className="empty-state">
              <h3>Could not load posts.</h3>
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
            <div className="posts-grid">
              {filtered.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No blogs found.</h3>
              <p>Try a different search term or category.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="section-cta">
              <Link className="btn-subscribe" to="/blogs">
                Browse all blogs
              </Link>
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section" id="categories">
          <div className="container">
            <h2 className="section-title">Popular Categories</h2>
            <div className="chips">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`chip${
                    activeCats.includes(category) ? " active" : ""
                  }`}
                  onClick={() => toggleCategory(category)}
                  aria-pressed={activeCats.includes(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
