import { useState } from "react";

/**
 * Copy Link / WhatsApp / LinkedIn sharing (PRD §40). No social SDKs — just
 * the public share endpoints plus the clipboard.
 */
export default function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window === "undefined" ? "" : window.location.href;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const open = (target: string) => {
    window.open(target, "_blank", "noopener,noreferrer,width=640,height=520");
  };

  return (
    <div className="share-row">
      <span className="share-label">Share this article</span>

      <button type="button" className="share-btn" onClick={() => void copy()}>
        {copied ? "✓ Copied" : "Copy Link"}
      </button>

      <button
        type="button"
        className="share-btn"
        onClick={() =>
          open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`)
        }
      >
        WhatsApp
      </button>

      <button
        type="button"
        className="share-btn"
        onClick={() =>
          open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
          )
        }
      >
        LinkedIn
      </button>

      <button
        type="button"
        className="share-btn"
        onClick={() =>
          open(
            `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
          )
        }
      >
        X
      </button>
    </div>
  );
}
