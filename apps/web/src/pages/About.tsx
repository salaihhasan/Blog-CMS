import { Link } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import { categoriesOf, usePublicBlogs } from "../hooks/usePublicBlogs";

export default function About() {
  const { data, loading } = usePublicBlogs();
  const posts = data ?? [];
  const categories = categoriesOf(posts);

  const stat = (label: string, value: string | number) => (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <h1 className="section-title">About</h1>

          <div className="prose">
            <p>
              Blogify is a small publishing platform. Articles are written in a
              rich text editor by an administrator, stored through an API, and
              published to this site the moment they go live.
            </p>
            <p>
              There is no hardcoded content here. Every card, category and
              article on this site is fetched from the backend, so anything you
              publish in the admin panel appears on the public site
              immediately — and anything you keep as a draft stays private.
            </p>
          </div>

          <div className="stat-grid" style={{ marginTop: 28 }}>
            {stat("Published articles", loading ? "—" : posts.length)}
            {stat("Categories", loading ? "—" : categories.length)}
            {stat(
              "Total tags",
              loading
                ? "—"
                : new Set(posts.flatMap((p) => p.tags)).size
            )}
          </div>

          {categories.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 36 }}>
                What we write about
              </h2>
              <div className="chips">
                {categories.map((name) => (
                  <Link key={name} className="chip" to={`/blogs?category=${encodeURIComponent(name)}`}>
                    {name}
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="prose" style={{ marginTop: 32 }}>
            <h2>Get in touch</h2>
            <p>
              Questions, corrections or a story idea? The{" "}
              <Link to="/contact">contact page</Link> has the details.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
