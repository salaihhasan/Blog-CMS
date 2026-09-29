import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogsApi, clearSession } from "../../services/api";
import { useAdmin } from "../../hooks/useAdmin";
import { formatDate, stripHtml } from "../../utils/blog";
import type { Blog } from "../../types/blog";
import { IconBell, IconMenu, IconSearch } from "./icons";

interface HeaderProps {
  onMenu: () => void;
}

/** Trimmed projection — the raw HTML body is kept only as searchable text. */
type SearchablePost = Pick<
  Blog,
  "id" | "title" | "description" | "category" | "tags" | "status" | "updatedAt"
> & { body: string };

const MAX_RESULTS = 6;

const toSearchable = (blog: Blog): SearchablePost => ({
  id: blog.id,
  title: blog.title,
  description: blog.description,
  category: blog.category,
  tags: blog.tags,
  status: blog.status,
  updatedAt: blog.updatedAt,
  body: stripHtml(blog.content).toLowerCase(),
});

/** Matches on every field a reader would expect: title, copy, body, category, tags. */
const matches = (post: SearchablePost, q: string) =>
  post.title.toLowerCase().includes(q) ||
  post.description.toLowerCase().includes(q) ||
  post.body.includes(q) ||
  post.category.toLowerCase().includes(q) ||
  post.tags.some((tag) => tag.toLowerCase().includes(q));

export const Header = ({ onMenu }: HeaderProps) => {
  const navigate = useNavigate();
  const { name: adminName, initials } = useAdmin();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [adminPosts, setAdminPosts] = useState<SearchablePost[]>([]);
  const [publicPosts, setPublicPosts] = useState<SearchablePost[]>([]);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const logout = () => {
    clearSession();
    navigate("/admin/login", { replace: true });
  };

  // Loaded once and filtered in memory — the post list is small enough that
  // re-querying the backend on every keystroke would be wasteful. Each source
  // is independent so one failure still leaves the other usable.
  useEffect(() => {
    let cancelled = false;

    blogsApi
      .list()
      .then((data) => {
        if (!cancelled) setAdminPosts(data.map(toSearchable));
      })
      .catch(() => {
        // Search is an enhancement; a failed fetch just leaves this empty.
      });

    blogsApi
      .listPublic()
      .then((data) => {
        if (!cancelled) setPublicPosts(data.map(toSearchable));
      })
      .catch(() => {
        // Public endpoint unreachable — hide the group rather than break search.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // A post already in the admin list is the same record the public feed
    // returns, so only surface the public group for what the admin list misses.
    const adminIds = new Set(adminPosts.map((post) => post.id));
    const live = adminPosts.filter((post) => matches(post, q)).slice(0, MAX_RESULTS);
    const publicOnly = publicPosts
      .filter((post) => !adminIds.has(post.id) && matches(post, q))
      .slice(0, MAX_RESULTS);

    return [
      { key: "admin", label: "Posts", items: live },
      { key: "public", label: "Public blogs", items: publicOnly },
    ].filter((group) => group.items.length > 0);
  }, [adminPosts, publicPosts, query]);

  const results = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  );

  // Close the panel on an outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const goToPost = (id: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/admin/blogs/edit/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToPost(results[active].id);
    }
  };

  return (
    <header className="admin-header">
      <button
        type="button"
        className="hamburger"
        aria-label="Open menu"
        onClick={onMenu}
      >
        <IconMenu size={20} />
      </button>

      <div className="header-search" ref={boxRef}>
        <IconSearch size={15} />
        <input
          type="search"
          placeholder="Search posts..."
          aria-label="Search posts"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {open && query.trim() && (
          <div className="search-panel" role="listbox">
            {results.length === 0 ? (
              <p className="search-panel-empty">
                No posts match &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.key} className="search-panel-group">
                  <p className="search-panel-label">{group.label}</p>
                  {group.items.map((post) => {
                    const i = results.indexOf(post);
                    return (
                      <button
                        key={`${group.key}-${post.id}`}
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        className={`search-panel-item${i === active ? " active" : ""}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goToPost(post.id)}
                      >
                        <span className="search-panel-title">{post.title}</span>
                        <span className="search-panel-meta">
                          {post.status === "published" ? "Published" : "Draft"}
                          {post.category ? ` · ${post.category}` : ""}
                          {post.updatedAt ? ` · ${formatDate(post.updatedAt)}` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="header-right">
        <span className="live-badge">Platform Live</span>
        <button
          type="button"
          className="ghost-icon"
          aria-label="Notifications"
        >
          <IconBell size={18} />
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
          Logout
        </button>
        <span className="avatar sm" title={adminName}>
          {initials}
        </span>
      </div>
    </header>
  );
};
