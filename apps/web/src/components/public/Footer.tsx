import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const quickLinks = [
  { label: "All Articles", to: "/blogs" },
  { label: "Contributor Program", to: "/about" },
  { label: "Editorial Guidelines", to: "/about" },
];

const footerCategories = [
  "React & Next.js",
  "TypeScript Engineering",
  "Design Systems",
  "DevOps & Scale",
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(
    null
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setMsg({ text: "Please enter a valid email address.", error: true });
      return;
    }
    setMsg({ text: "You're on the list. Welcome aboard!", error: false });
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>
              An open, elegant platform dedicated to technical documentation,
              clean product design, and architectural engineering insights.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Categories</h4>
            <ul>
              {footerCategories.map((category) => (
                <li key={category}>
                  <Link to="/blogs">{category}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="digest">
            <h4>Weekly Digest</h4>
            <p>
              Get fresh architectural and styling tutorials delivered straight
              to your inbox.
            </p>
            <form className="digest-form" onSubmit={submit} noValidate>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button className="btn-join" type="submit">
                Join
              </button>
            </form>
            {msg && (
              <p className={`digest-msg${msg.error ? " error" : ""}`}>
                {msg.text}
              </p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Blogify. All rights reserved. Made with love for developers.</p>
          <div className="socials">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 3.4 5a4.5 4.5 0 0 0 1.4 6 4.4 4.4 0 0 1-2-.5v.1a4.5 4.5 0 0 0 3.6 4.4 4.6 4.6 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 2 20.4a12.7 12.7 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.2-2.3z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.4.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.3v1.6h.1c.5-.9 1.6-1.9 3.3-1.9 3.6 0 4.2 2.3 4.2 5.4v6.3zM5.3 7.4a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1zm1.8 13H3.6V9h3.5v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7c0-.9-.8-1.7-1.8-1.7z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
