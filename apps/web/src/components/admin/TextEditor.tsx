import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import { fileToDataUri } from "../../utils/image";
import { downloadText, htmlToMarkdown } from "../../utils/markdown";

/**
 * `TextStyle` ships no `fontSize` attribute, so `setMark("textStyle", …)`
 * silently drops it. This declares it and exposes set/unset commands.
 */
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size || null }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});

/** PRD §11 — a small, fixed font list is enough. */
const FONTS = [
  "Arial",
  "Roboto",
  "Poppins",
  "Georgia",
  "Times New Roman",
];

/** PRD §10 — font sizes. */
const FONT_SIZES = [
  { label: "Small", value: "13px" },
  { label: "Normal", value: "" },
  { label: "Large", value: "18px" },
  { label: "Extra Large", value: "22px" },
];

const TEXT_COLORS = [
  "#111827",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
];

const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#e5e7eb"];

const EMOJIS = [
  "😀", "😂", "😍", "😎", "🤔", "🙌",
  "🔥", "🚀", "💡", "🎉", "❤️", "⭐",
  "✅", "⚠️", "🐛", "📌", "☕", "🌍",
];

/**
 * PRD §13 — predefined stickers as inline SVG data URIs, so they need no
 * hosting and render identically on the public site.
 */
const STICKERS: { label: string; svg: string }[] = [
  {
    label: "Celebration",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#fde68a"/><path d="M14 25l6 6 14-14" stroke="#92400e" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: "Idea",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#fef08a"/><path d="M24 12a8 8 0 00-4 15v3h8v-3a8 8 0 00-4-15z" fill="#ca8a04"/><rect x="21" y="32" width="6" height="3" rx="1.5" fill="#ca8a04"/></svg>`,
  },
  {
    label: "Success",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#bbf7d0"/><path d="M15 24l6 6 12-12" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: "Warning",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 6l20 36H4z" fill="#fde68a" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/><rect x="22" y="18" width="4" height="12" rx="2" fill="#b45309"/><circle cx="24" cy="34" r="2.4" fill="#b45309"/></svg>`,
  },
  {
    label: "Technology",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="6" y="14" width="36" height="24" rx="4" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2.5"/><rect x="14" y="20" width="20" height="4" rx="2" fill="#1d4ed8"/><rect x="14" y="28" width="12" height="4" rx="2" fill="#60a5fa"/></svg>`,
  },
];

const svgToDataUri = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(svg)}`;

interface TextEditorProps {
  /** HTML content, as stored in the `content` column. */
  value: string;
  onChange: (html: string) => void;
  /** Called after a `.md` file is parsed, so the page can react (e.g. title). */
  onMarkdownLoaded?: (markdown: string) => void;
  /** Base name for the exported file. */
  exportName?: string;
  error?: string;
}

export default function TextEditor({
  value,
  onChange,
  onMarkdownLoaded,
  exportName = "post",
  error,
}: TextEditorProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const stickerBtnRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      // StarterKit already ships bold, italic, underline, strike, headings,
      // lists, link, blockquote and code block.
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Push external content (e.g. an uploaded .md file) into the editor.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const onPickImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;

    const result = await fileToDataUri(file);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    editor.chain().focus().setImage({ src: result.dataUri }).run();
  };

  /**
   * PRD §14/§15 — read a `.md` file, convert it to HTML and drop it into the
   * editor. The markdown source is also handed back so the caller can
   * prefill the title from the first `# heading`.
   */
  const onPickMarkdown = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;

    if (!/\.(md|markdown)$/i.test(file.name)) {
      window.alert("Please choose a .md or .markdown file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const markdown = String(reader.result ?? "");
      if (!markdown.trim()) {
        window.alert("That file is empty.");
        return;
      }
      const { marked } = await import("marked");
      editor.commands.setContent(marked.parse(markdown) as string);
      onMarkdownLoaded?.(markdown);
    };
    reader.onerror = () => window.alert("Could not read that file.");
    reader.readAsText(file);
  };

  /**
   * PRD §19 — adds a caption line under the most recent image. Implemented as
   * a paragraph directly after the image so it survives the round trip through
   * the plain-HTML `content` column without a custom node.
   */
  const addCaption = () => {
    if (!editor) return;
    const text = window.prompt("Image caption", "");
    if (!text) return;

    const { state } = editor;
    const { empty } = state.selection;
    if (empty) {
      window.alert("Place the cursor right after an image first.");
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "paragraph",
        content: [
          {
            type: "text",
            text,
            marks: [{ type: "italic" }],
          },
        ],
      })
      .run();
  };

  /**
   * Closing either panel returns focus to the button that opened it, so
   * keyboard users are not dropped back at the top of the document.
   */
  const closeEmoji = (ref: React.RefObject<HTMLButtonElement | null>) => {
    setEmojiOpen(false);
    setStickerOpen(false);
    ref.current?.focus();
  };

  // Escape closes whichever panel is open, from anywhere in the editor.
  useEffect(() => {
    if (!emojiOpen && !stickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (emojiOpen) closeEmoji(emojiBtnRef);
      else closeEmoji(stickerBtnRef);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [emojiOpen, stickerOpen]);

  /** PRD §66 "Markdown Export" — download the article as a .md file. */
  const onExport = () => {
    if (!value.trim()) return;
    const markdown = htmlToMarkdown(value);
    const name = exportName.trim() || "post";
    downloadText(`${name}.md`, `# ${name}\n\n${markdown}\n`);
  };

  if (!editor) {
    return <div className="editor-area" style={{ minHeight: 260 }} />;
  }

  const btn = (active: boolean) =>
    `editor-btn${active ? " active" : ""}`;

  return (
    <div className="editor-shell">
      <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
        <button
          type="button"
          className={btn(editor.isActive("bold"))}
          title="Bold"
          aria-label="Bold"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={btn(editor.isActive("italic"))}
          title="Italic"
          aria-label="Italic"
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={btn(editor.isActive("underline"))}
          title="Underline"
          aria-label="Underline"
          aria-pressed={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        <button
          type="button"
          className={btn(editor.isActive("strike"))}
          title="Strikethrough"
          aria-label="Strikethrough"
          aria-pressed={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </button>

        <span className="editor-sep" aria-hidden="true" />

        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            className={btn(editor.isActive("heading", { level }))}
            title={`Heading ${level}`}
            aria-label={`Heading ${level}`}
            aria-pressed={editor.isActive("heading", { level })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 })
                .run()
            }
          >
            H{level}
          </button>
        ))}
        <button
          type="button"
          className={btn(editor.isActive("paragraph"))}
          title="Paragraph"
          aria-label="Paragraph"
          aria-pressed={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          ¶
        </button>

        <span className="editor-sep" aria-hidden="true" />

        <button
          type="button"
          className={btn(editor.isActive("bulletList"))}
          title="Bullet list"
          aria-label="Bullet list"
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button
          type="button"
          className={btn(editor.isActive("orderedList"))}
          title="Numbered list"
          aria-label="Numbered list"
          aria-pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>

        <span className="editor-sep" aria-hidden="true" />

        <button
          type="button"
          className={btn(editor.isActive("blockquote"))}
          title="Quote"
          aria-label="Quote"
          aria-pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </button>
        <button
          type="button"
          className={btn(editor.isActive("codeBlock"))}
          title="Code block"
          aria-label="Code block"
          aria-pressed={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"{ }"}
        </button>
        <button
          type="button"
          className={btn(editor.isActive("link"))}
          title="Insert link"
          aria-label="Insert link"
          aria-pressed={editor.isActive("link")}
          onClick={setLink}
        >
          🔗
        </button>
        <button
          type="button"
          className={btn(false)}
          title="Insert image"
          aria-label="Insert image"
          onClick={() => imageRef.current?.click()}
        >
          ▣
        </button>

        <span className="editor-sep" aria-hidden="true" />

        <select
          className="editor-select"
          title="Font family"
          aria-label="Font family"
          value={
            (editor.getAttributes("textStyle").fontFamily as string) ?? ""
          }
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .setFontFamily(e.target.value)
              .run()
          }
        >
          <option value="">Font</option>
          {FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <select
          className="editor-select"
          title="Font size"
          aria-label="Font size"
          value={
            (editor.getAttributes("textStyle").fontSize as string) ?? ""
          }
          onChange={(e) =>
            editor.chain().focus().setFontSize(e.target.value).run()
          }
        >
          {FONT_SIZES.map((size) => (
            <option key={size.label} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <select
          className="editor-select"
          title="Text alignment"
          aria-label="Text alignment"
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;
            editor
              .chain()
              .focus()
              .setTextAlign(
                value as "left" | "center" | "right" | "justify"
              )
              .run();
            e.target.value = "";
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Align
          </option>
          {(["left", "center", "right", "justify"] as const).map((align) => (
            <option key={align} value={align}>
              {align[0].toUpperCase() + align.slice(1)}
            </option>
          ))}
        </select>

        <span className="editor-sep" aria-hidden="true" />

        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="editor-swatch"
            style={{ background: color }}
            title={`Text colour ${color}`}
            aria-label={`Text colour ${color}`}
            onClick={() => editor.chain().focus().setColor(color).run()}
          />
        ))}

        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="editor-swatch"
            style={{ background: color }}
            title={`Highlight ${color}`}
            aria-label={`Highlight ${color}`}
            onClick={() =>
              editor.chain().focus().setHighlight({ color }).run()
            }
          />
        ))}

        <span className="editor-sep" aria-hidden="true" />

        <button
          type="button"
          ref={emojiBtnRef}
          className="editor-btn"
          title="Insert emoji"
          aria-label="Insert emoji"
          aria-expanded={emojiOpen}
          onClick={() => {
            setStickerOpen(false);
            setEmojiOpen((o) => !o);
          }}
        >
          😀
        </button>
        {emojiOpen && (
          <div
            className="emoji-picker"
            role="menu"
            aria-label="Emoji"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                closeEmoji(emojiBtnRef);
              }
            }}
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                onClick={() => {
                  editor.chain().focus().insertContent(emoji).run();
                  closeEmoji(emojiBtnRef);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <span className="editor-sep" aria-hidden="true" />

        <button
          type="button"
          ref={stickerBtnRef}
          className="editor-btn"
          title="Insert sticker"
          aria-label="Insert sticker"
          aria-expanded={stickerOpen}
          onClick={() => {
            setEmojiOpen(false);
            setStickerOpen((o) => !o);
          }}
        >
          ⭐
        </button>
        {stickerOpen && (
          <div
            className="emoji-picker"
            role="menu"
            aria-label="Stickers"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                closeEmoji(stickerBtnRef);
              }
            }}
          >
            {STICKERS.map((sticker) => (
              <button
                key={sticker.label}
                type="button"
                role="menuitem"
                title={sticker.label}
                aria-label={`Insert ${sticker.label} sticker`}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: svgToDataUri(sticker.svg) })
                    .run();
                  closeEmoji(stickerBtnRef);
                }}
              >
                <img src={svgToDataUri(sticker.svg)} alt="" width={22} height={22} />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="editor-btn"
          title="Add caption to last image (PRD §19)"
          aria-label="Add caption to last image"
          onClick={addCaption}
        >
          ⌐
        </button>

        <span className="editor-sep" aria-hidden="true" />

        <button
          type="button"
          className="editor-btn"
          title="Undo"
          aria-label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </button>
        <button
          type="button"
          className="editor-btn"
          title="Redo"
          aria-label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-foot">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
        >
          Upload Markdown (.md)
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={!value.trim()}
          title="Download this content as a .md file"
          onClick={onExport}
        >
          Export .md
        </button>
        <span className="editor-hint">
          Uploading replaces the editor content. You can keep editing after.
        </span>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".md,.markdown,text/markdown"
          onChange={onPickMarkdown}
        />
        <input
          ref={imageRef}
          type="file"
          hidden
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onPickImage}
        />
      </div>

      {error && <p className="hint err">{error}</p>}
    </div>
  );
}
