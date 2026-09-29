import { Link } from "react-router-dom";
import type { Blog } from "../../types/blog";
import {
  authorColor,
  authorInitials,
  formatDate,
  labelTone,
  readingTime,
} from "../../utils/blog";

export default function BlogCard({ post }: { post: Blog }) {
  return (
    <article className="post-card">
      <Link
        to={`/blog/${post.slug}`}
        className="thumb"
        aria-label={post.title}
        tabIndex={-1}
      >
        <img
          src={post.thumbnail}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </Link>
      <div className="post-body">
        <span className={`post-label c${labelTone(post.category)}`}>
          {post.category}
        </span>
        <h3 className="post-title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="post-excerpt">{post.description}</p>
        <div className="post-footer">
          <span
            className="avatar avatar-sm"
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
          <span className="meta-date">{readingTime(post.content)} min read</span>
        </div>
        <Link className="card-read-more" to={`/blog/${post.slug}`}>
          Read More →
        </Link>
      </div>
    </article>
  );
}
