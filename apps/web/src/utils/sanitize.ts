import DOMPurify, { type Config } from "dompurify";

/**
 * Sanitises admin-authored article HTML before it is injected into the page.
 *
 * `content` is stored as raw HTML and rendered with
 * `dangerouslySetInnerHTML`, so without this any `<script>`, `onerror=` or
 * `javascript:` URL an admin saved would run for every public visitor.
 *
 * The tag/attribute allow-list is tuned for what the editor can produce, so
 * formatting (colours, fonts, alignment, highlight, code blocks) survives.
 */
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "mark", "sub", "sup",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img", "span", "div",
];

const ALLOWED_ATTR = [
  "href", "title", "target", "rel",
  "src", "alt", "width", "height",
  "style", "class",
  "data-color", "data-language",
];

let cached: Config | undefined;

const config = (): Config => {
  if (!cached) {
    cached = {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      // Strip anything that can execute.
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
      ALLOW_DATA_ATTR: true,
    };
  }
  return cached;
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return "";
  // DOMPurify returns TrustedHTML when Trusted Types are on; store as string.
  return String(DOMPurify.sanitize(html, config()));
};

/*
 * Note on `data:` image sources: DOMPurify passes base64 `data:image/*` blobs
 * through, including `svg+xml`. That is safe here because an SVG referenced
 * from an `<img src>` cannot run scripts, and the upload path in
 * utils/image.ts rejects `image/svg+xml`, so the only SVG data URIs that can
 * exist are the hardcoded stickers in the editor.
 */
