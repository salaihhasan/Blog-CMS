import { Link } from "react-router-dom";
import type { Blog } from "../../types/blog";
import {
  authorColor,
  authorInitials,
  formatDate,
  readingTime,
} from "../../utils/blog";

export default function FeaturedHero({ post }: { post: Blog }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-card">
          <img
            className="hero-img"
            src={post.thumbnail}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="hero-content">
            <span className="badge">{post.category}</span>
            <h1 className="hero-title">
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h1>
            <div className="meta-row">
              <span
                className="avatar avatar-lg"
                style={{ background: authorColor(post.author) }}
                aria-hidden="true"
              >
                {authorInitials(post.author)}
              </span>
              <span className="meta-name">{post.author}</span>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <span className="meta-date">{formatDate(post.createdAt)}</span>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <span className="meta-date">
                {readingTime(post.content)} min read
              </span>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <Link className="read-more" to={`/blog/${post.slug}`}>
                Read More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
