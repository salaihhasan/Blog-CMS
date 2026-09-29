/**
 * Turns stored article HTML back into Markdown so a post can be downloaded
 * and re-imported (PRD §66 "Markdown Export").
 *
 * This is deliberately a small, dependency-free serialiser covering the
 * constructs the editor can produce. It is not a full CommonMark
 * implementation — anything it does not recognise falls back to its text.
 */

const BLOCK_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "blockquote", "pre", "hr", "div",
]);

const escapeText = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeInline = (s: string) =>
  escapeText(s).replace(/([\\`*_[\]])/g, "\\$1");

export const htmlToMarkdown = (html: string): string => {
  if (!html) return "";

  const doc = new DOMParser().parseFromString(
    `<div id="root">${html}</div>`,
    "text/html"
  );
  const root = doc.getElementById("root");
  if (!root) return "";

  const walk = (node: Node, listDepth: number, inPre: boolean): string => {
    if (node.nodeType === 3) {
      const text = node.textContent ?? "";
      return inPre ? text : escapeInline(text);
    }
    if (node.nodeType !== 1) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    const children = (pre = inPre) =>
      [...el.childNodes].map((c) => walk(c, listDepth, pre)).join("");

    switch (tag) {
      case "br":
        return "\n";
      case "hr":
        return "\n\n---\n\n";
      case "h1":
        return `\n\n# ${children().trim()}\n\n`;
      case "h2":
        return `\n\n## ${children().trim()}\n\n`;
      case "h3":
        return `\n\n### ${children().trim()}\n\n`;
      case "h4":
        return `\n\n#### ${children().trim()}\n\n`;
      case "h5":
        return `\n\n##### ${children().trim()}\n\n`;
      case "h6":
        return `\n\n###### ${children().trim()}\n\n`;
      case "strong":
      case "b": {
        const inner = children().trim();
        return inner ? `**${inner}**` : "";
      }
      case "em":
      case "i": {
        const inner = children().trim();
        return inner ? `*${inner}*` : "";
      }
      case "u": {
        // No Markdown underline; keep the text.
        return children();
      }
      case "s":
      case "strike":
      case "del": {
        // `marked` emits <del> for ~~strikethrough~~, the editor emits <s>.
        const inner = children().trim();
        return inner ? `~~${inner}~~` : "";
      }
      case "code": {
        // Only fence inline code; a code block is handled by `pre`.
        if (el.parentElement?.tagName.toLowerCase() === "pre") {
          return children(true);
        }
        const inner = children(true).trim();
        return inner ? `\`${inner}\`` : "";
      }
      case "pre": {
        const code = el.querySelector("code");
        const lang = (code?.className ?? "")
          .replace(/^.*language-([\w-]+).*$/, "$1")
          .trim();
        const body = (code ?? el).textContent ?? "";
        return `\n\n\`\`\`${/^[\w-]+$/.test(lang) ? lang : ""}\n${body.replace(/\n$/, "")}\n\`\`\`\n\n`;
      }
      case "a": {
        const href = el.getAttribute("href") ?? "";
        const label = children().trim();
        return href ? `[${label}](${href})` : label;
      }
      case "img": {
        const src = el.getAttribute("src") ?? "";
        const alt = el.getAttribute("alt") ?? "";
        return src ? `![${alt}](${src})` : "";
      }
      case "blockquote": {
        const inner = children()
          .trim()
          .split("\n")
          .map((l) => (l.trim() ? `> ${l}` : ">"))
          .join("\n");
        return `\n\n${inner}\n\n`;
      }
      case "ul":
      case "ol": {
        const ordered = tag === "ol";
        const start = Number(el.getAttribute("start") ?? 1) || 1;
        const items = [...el.children]
          .filter((c) => c.tagName.toLowerCase() === "li")
          .map((li, i) => {
            const marker = ordered ? `${start + i}.` : "-";
            // A checkbox task item round-trips back through the importer.
            const box = li.querySelector('input[type="checkbox"]');
            const body = [...li.childNodes].map((c) => walk(c, listDepth + 1, inPre)).join("").trim();
            const prefix = box ? `- [${(box as HTMLInputElement).checked ? "x" : " "}]` : `${marker} `;
            const indent = "  ".repeat(listDepth);
            return `${indent}${prefix}${body}`;
          });
        return `\n${items.join("\n")}\n`;
      }
      case "li":
        // Reached only for a stray <li> outside a list.
        return children();
      default: {
        if (BLOCK_TAGS.has(tag)) return `\n${children()}\n`;
        return children();
      }
    }
  };

  return [...root.childNodes]
    .map((n) => walk(n, 0, false))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
};

/** Triggers a browser download of the given text as a file. */
export const downloadText = (filename: string, text: string) => {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
