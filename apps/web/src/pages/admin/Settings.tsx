import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { useToast } from "../../components/admin/Toast";
import { IconCheck } from "../../components/admin/icons";

type TabKey = "general" | "seo" | "social" | "email" | "advanced";

const tabs: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "seo", label: "SEO" },
  { key: "social", label: "Social Media" },
  { key: "email", label: "Email" },
  { key: "advanced", label: "Advanced" },
];

const defaults = {
  siteTitle: "Blogify",
  siteDescription:
    "A tech blog exploring modern software engineering, product analytics, and design patterns.",
  siteUrl: "https://blog.blogify.com",
  timezone: "UTC-5 (EST) Eastern Standard Time",
  language: "English (United States)",
  postsPerPage: "12",
  metaTitle: "Blogify — Stories for builders",
  metaKeywords: "engineering, design, product, react, node",
  ogImage: "https://blog.blogify.com/og.png",
  twitter: "https://twitter.com/blogify",
  linkedin: "https://linkedin.com/company/blogify",
  github: "https://github.com/blogify",
  fromName: "Blogify",
  fromEmail: "no-reply@blogify.com",
  replyTo: "hello@blogify.com",
  digest: "weekly",
  commentsEnabled: true,
  maintenance: false,
  registration: false,
};

type Settings = typeof defaults;

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  type = "text",
  textarea,
}: FieldProps) {
  return (
    <div className="field">
      <label className="label plain" htmlFor={id}>
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          className="textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="session-row">
      <div>
        <div className="session-name">{title}</div>
        <div className="session-meta">{desc}</div>
      </div>
      <button
        type="button"
        className={`switch${on ? " on" : ""}`}
        role="switch"
        aria-checked={on}
        aria-label={`Toggle ${title}`}
        onClick={onToggle}
      />
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<TabKey>("general");
  const [form, setForm] = useState<Settings>(defaults);
  const { show, node } = useToast();

  const set = (key: keyof Settings) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.siteTitle.trim()) {
      show("Site title is required.", "error");
      return;
    }
    show("Settings saved successfully.");
  };

  const reset = () => {
    setForm(defaults);
    show("Settings restored to defaults.");
  };

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your site configurations and preferences.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-outline" onClick={reset}>
            Reset Defaults
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => show("Settings saved successfully.")}
          >
            <IconCheck size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab${tab === item.key ? " active" : ""}`}
            onClick={() => setTab(item.key)}
            aria-pressed={tab === item.key}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={save} noValidate>
        {tab === "general" && (
          <>
            <section className="card">
              <div className="card-title">General Configurations</div>
              <div
                style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "16px 0 20px",
                }}
              />
              <Field
                id="site-title"
                label="Site Title"
                hint="The main public title displayed in metadata and header templates."
                value={form.siteTitle}
                onChange={set("siteTitle")}
              />
              <Field
                id="site-desc"
                label="Site Description"
                hint="A short tagline used for search engines and social cards."
                value={form.siteDescription}
                onChange={set("siteDescription")}
                textarea
              />
              <Field
                id="site-url"
                label="Site URL"
                hint="The production canonical address of your front-end deployment."
                value={form.siteUrl}
                onChange={set("siteUrl")}
                type="url"
              />
              <div className="form-row">
                <div className="field">
                  <label className="label plain" htmlFor="tz">
                    Timezone
                  </label>
                  <select
                    id="tz"
                    className="select"
                    value={form.timezone}
                    onChange={(e) => set("timezone")(e.target.value)}
                  >
                    <option>UTC-5 (EST) Eastern Standard Time</option>
                    <option>UTC+0 (GMT) Greenwich Mean Time</option>
                    <option>UTC+5:30 (IST) India Standard Time</option>
                    <option>UTC+8 (SGT) Singapore Time</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label plain" htmlFor="lang">
                    Language
                  </label>
                  <select
                    id="lang"
                    className="select"
                    value={form.language}
                    onChange={(e) => set("language")(e.target.value)}
                  >
                    <option>English (United States)</option>
                    <option>English (United Kingdom)</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>
              <Field
                id="per-page"
                label="Posts Per Page"
                hint="The default pagination threshold size for home feed queries."
                value={form.postsPerPage}
                onChange={set("postsPerPage")}
                type="number"
              />
            </section>

            <div className="danger-zone">
              <div className="danger-row">
                <div>
                  <div className="danger-title">Danger Zone</div>
                  <p className="danger-desc">
                    Resetting the installation clears all posts, media and
                    configuration. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => show("Nothing was reset in demo mode.", "error")}
                >
                  Reset Installation
                </button>
              </div>
            </div>
          </>
        )}

        {tab === "seo" && (
          <section className="card">
            <div className="card-title">Search Engine Optimisation</div>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "16px 0 20px",
              }}
            />
            <Field
              id="meta-title"
              label="Meta Title"
              hint="Shown in browser tabs and search result headlines."
              value={form.metaTitle}
              onChange={set("metaTitle")}
            />
            <Field
              id="meta-keywords"
              label="Meta Keywords"
              hint="Comma separated phrases used for internal tagging."
              value={form.metaKeywords}
              onChange={set("metaKeywords")}
            />
            <Field
              id="og-image"
              label="Default Social Share Image"
              hint="Absolute URL of the image used when a post is shared."
              value={form.ogImage}
              onChange={set("ogImage")}
              type="url"
            />
          </section>
        )}

        {tab === "social" && (
          <section className="card">
            <div className="card-title">Social Profiles</div>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "16px 0 20px",
              }}
            />
            <Field
              id="twitter"
              label="X / Twitter"
              value={form.twitter}
              onChange={set("twitter")}
              type="url"
            />
            <Field
              id="linkedin"
              label="LinkedIn"
              value={form.linkedin}
              onChange={set("linkedin")}
              type="url"
            />
            <Field
              id="github"
              label="GitHub"
              value={form.github}
              onChange={set("github")}
              type="url"
            />
          </section>
        )}

        {tab === "email" && (
          <section className="card">
            <div className="card-title">Email Delivery</div>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "16px 0 20px",
              }}
            />
            <div className="form-row">
              <Field
                id="from-name"
                label="From Name"
                value={form.fromName}
                onChange={set("fromName")}
              />
              <Field
                id="from-email"
                label="From Email"
                value={form.fromEmail}
                onChange={set("fromEmail")}
                type="email"
              />
            </div>
            <Field
              id="reply-to"
              label="Reply-To Address"
              value={form.replyTo}
              onChange={set("replyTo")}
              type="email"
            />
            <div className="field">
              <label className="label plain" htmlFor="digest">
                Digest Frequency
              </label>
              <select
                id="digest"
                className="select"
                value={form.digest}
                onChange={(e) => set("digest")(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </div>
          </section>
        )}

        {tab === "advanced" && (
          <section className="card">
            <div className="card-title">Advanced</div>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "16px 0 6px",
              }}
            />
            <ToggleRow
              title="Comments"
              desc="Allow readers to comment on published posts."
              on={form.commentsEnabled}
              onToggle={() =>
                setForm((p) => ({ ...p, commentsEnabled: !p.commentsEnabled }))
              }
            />
            <ToggleRow
              title="Maintenance Mode"
              desc="Show a coming-soon page to everyone except admins."
              on={form.maintenance}
              onToggle={() =>
                setForm((p) => ({ ...p, maintenance: !p.maintenance }))
              }
            />
            <ToggleRow
              title="Open Registration"
              desc="Let visitors create reader accounts without an invite."
              on={form.registration}
              onToggle={() =>
                setForm((p) => ({ ...p, registration: !p.registration }))
              }
            />
          </section>
        )}

        <div className="form-actions" style={{ marginTop: 22 }}>
          <button type="submit" className="btn btn-primary">
            <IconCheck size={16} />
            Save Changes
          </button>
          <button type="button" className="btn btn-outline" onClick={reset}>
            Reset Defaults
          </button>
        </div>
      </form>

      {node}
    </AdminLayout>
  );
}
