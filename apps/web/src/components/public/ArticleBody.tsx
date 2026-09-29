import type { Blog } from "../../types/blog";
import { sanitizeHtml } from "../../utils/sanitize";
import {
  authorColor,
  authorInitials,
  formatDate,
  labelTone,
  readingTime,
} from "../../utils/blog";

/**
 * Renders a blog's article body exactly as the public details page does.
 * Shared by the public page and the admin preview (PRD §27) so the preview
 * cannot drift from what visitors actually see.
 */
export default function ArticleBody({
  post,
  showHero = true,
}: {
  post: Blog;
  showHero?: boolean;
}) {
  return (
    <>
      <span className={`post-label c${labelTone(post.category)}`}>
        {post.category}
      </span>
      <h1 className="article-title">{post.title}</h1>

      <div className="article-meta">
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
        <span className="meta-date">
          {readingTime(post.content)} min read
        </span>
      </div>

      {showHero && post.thumbnail && (
        <img
          className="article-hero"
          src={post.thumbnail}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
      />
    </>
  );
}
