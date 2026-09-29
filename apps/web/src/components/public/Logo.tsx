import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.2V21h3.8L17.8 10l-3.8-3.8L3 17.2zM20.7 7.1a1 1 0 0 0 0-1.4l-2.4-2.4a1 1 0 0 0-1.4 0l-1.8 1.8 3.8 3.8 1.8-1.8z" />
        </svg>
      </span>
      Blogify
    </Link>
  );
}
