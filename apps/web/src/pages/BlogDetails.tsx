import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import BlogCard from "../components/public/BlogCard";
import ArticleBody from "../components/public/ArticleBody";
import ShareRow from "../components/public/ShareRow";
import Footer from "../components/public/Footer";
import { usePublicBlogs } from "../hooks/usePublicBlogs";

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error, refetch } = usePublicBlogs();

  const posts = useMemo(() => data ?? [], [data]);

  /**
   * There is no public single-post endpoint, so the post is resolved from
   * `GET /api/blogs/public` by slug. Drafts are absent from that list by
   * design, which is what keeps unpublished posts off the public site.
   */
  const post = useMemo(
    () => posts.find((p) => p.slug === slug),
    [posts, slug]
  );

  const related = useMemo(
    () =>
      post
        ? posts
            .filter((p) => p.id !== post.id && p.category === post.category)
            .slice(0, 3)
        : [],
    [posts, post]
  );

  return (
    <>
      <Navbar />

      <main className="section">
        <div className="container">
          {loading ? (
            <p className="empty-state">Loading article...</p>
          ) : error ? (
            <div className="empty-state">
              <h3>Could not load this article.</h3>
              <p>{error}</p>
              <button
                type="button"
                className="btn-subscribe"
                onClick={refetch}
              >
                Try again
              </button>
            </div>
          ) : !post ? (
            <div className="empty-state">
              <h3>Article not found.</h3>
              <p>
                This post may have been unpublished or the link may be wrong.
              </p>
              <Link className="btn-subscribe" to="/blogs">
                Browse all blogs
              </Link>
            </div>
          ) : (
            <>
              <article className="article">
                <ArticleBody post={post} />

                {post.tags.length > 0 && (
                  <div className="article-tags">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        className="chip"
                        to={`/blogs?tag=${encodeURIComponent(tag)}`}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                <ShareRow title={post.title} />
              </article>

              {related.length > 0 && (
                <section className="section" id="related">
                  <h2 className="section-title">Related Blogs</h2>
                  <div className="posts-grid">
                    {related.map((item) => (
                      <BlogCard key={item.id} post={item} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
