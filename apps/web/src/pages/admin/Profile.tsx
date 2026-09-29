import { useEffect, useState, type FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import { useToast } from "../../components/admin/Toast";
import { IconCheck, IconShield } from "../../components/admin/icons";
import { useAdmin } from "../../hooks/useAdmin";

type TabKey = "info" | "security" | "notifications";

const tabs: { key: TabKey; label: string; to: string }[] = [
  { key: "info", label: "Profile Information", to: "/admin/profile" },
  { key: "security", label: "Security & Password", to: "/admin/profile/security" },
  {
    key: "notifications",
    label: "Notifications",
    to: "/admin/profile/notifications",
  },
];

/**
 * Identity comes from the live session, not a hardcoded person. The backend
 * has no profile read/update endpoint, so anything not derivable from the
 * session is left blank rather than invented.
 */
const emptyProfile = { fullName: "", email: "", bio: "", website: "" };

const initialPassword = {
  current: "",
  next: "",
  confirm: "",
};

const sessions = [
  {
    id: "s1",
    name: "Current browser",
    meta: "Active session",
    active: true,
  },
  {
    id: "s2",
    name: "Previous session",
    meta: "Signed out",
    active: false,
  },
];

const notificationPrefs = [
  {
    id: "n1",
    title: "New comment on your posts",
    desc: "Email me when someone comments on a post I authored.",
    on: true,
  },
  {
    id: "n2",
    title: "Post published",
    desc: "Notify me when a draft moves to published status.",
    on: true,
  },
  {
    id: "n3",
    title: "Weekly digest",
    desc: "A Monday summary of traffic, comments and top posts.",
    on: false,
  },
  {
    id: "n4",
    title: "Security alerts",
    desc: "Warn me about new logins and password changes.",
    on: true,
  },
];

interface ProfileProps {
  tab: TabKey;
}

export default function Profile({ tab }: ProfileProps) {
  const { name, email, initials } = useAdmin();
  const [profile, setProfile] = useState(emptyProfile);
  // Fill the identity in once it resolves from the backend, and keep following
  // it if the admin object arrives after first paint.
  useEffect(() => {
    setProfile((prev) => ({ ...prev, fullName: name, email }));
  }, [name, email]);
  const [password, setPassword] = useState(initialPassword);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionList, setSessionList] = useState(sessions);
  const [prefs, setPrefs] = useState(notificationPrefs);
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<keyof typeof initialPassword, string>>
  >({});
  const { show, node } = useToast();

  const updateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (profile.fullName.trim().length < 2) {
      show("Please enter your full name.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      show("Please enter a valid email address.", "error");
      return;
    }
    show("Profile updated successfully.");
  };

  const updatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Partial<Record<keyof typeof initialPassword, string>> = {};

    if (!password.current) next.current = "Enter your current password";
    if (password.next.length < 8)
      next.next = "New password must be at least 8 characters";
    if (password.confirm !== password.next)
      next.confirm = "Passwords do not match";

    setPasswordErrors(next);
    if (Object.keys(next).length > 0) return;

    setPassword(initialPassword);
    show("Password updated successfully.");
  };

  return (
    <AdminLayout>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {tab === "security"
              ? "Security Settings"
              : tab === "notifications"
                ? "Notification Settings"
                : "Profile Settings"}
          </h1>
          <p className="page-sub">
            Manage your account details, security and preferences.
          </p>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.key === "info"}
            className={({ isActive }) => `tab${isActive ? " active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {tab === "info" && (
        <div className="profile-split">
          <form className="card" onSubmit={updateProfile} noValidate>
            <div className="profile-photo-row">
              <span className="avatar lg">{initials}</span>
              <div>
                <div className="form-actions">
                  <button type="button" className="btn btn-primary btn-sm">
                    Change Photo
                  </button>
                  <button type="button" className="btn btn-outline btn-sm">
                    Delete
                  </button>
                </div>
                <p className="hint">JPG, GIF or PNG. Max size of 800K.</p>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label" htmlFor="profile-name">
                  Full name
                </label>
                <input
                  id="profile-name"
                  className="input"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, fullName: e.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="profile-email">
                  Email address
                </label>
                <input
                  id="profile-email"
                  className="input"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="profile-bio">
                Short bio
              </label>
              <textarea
                id="profile-bio"
                className="textarea"
                value={profile.bio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, bio: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="profile-site">
                Personal website
              </label>
              <input
                id="profile-site"
                className="input"
                value={profile.website}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, website: e.target.value }))
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>

          <aside className="card">
            <div className="card-title">Public Author Card Preview</div>
            <div className="preview-card" style={{ marginTop: 16 }}>
              <span className="avatar lg" style={{ margin: "0 auto" }}>
                {initials}
              </span>
              <div className="preview-name">{profile.fullName}</div>
              <div className="preview-role">Administrator</div>
              <p className="preview-bio">{profile.bio}</p>
              <div className="preview-links">
                <span aria-label="Twitter">𝕏</span>
                <span aria-label="GitHub">⌥</span>
                <span aria-label="Website">◍</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === "security" && (
        <div className="split">
          <form className="card" onSubmit={updatePassword} noValidate>
            <div className="card-title" style={{ marginBottom: 18 }}>
              Change Password
            </div>

            <div className="field">
              <label className="label" htmlFor="cur-pass">
                Current password
              </label>
              <input
                id="cur-pass"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password.current}
                onChange={(e) => {
                  setPassword((p) => ({ ...p, current: e.target.value }));
                  setPasswordErrors((p) => ({ ...p, current: undefined }));
                }}
              />
              {passwordErrors.current && (
                <p className="hint" style={{ color: "#dc2626" }}>
                  {passwordErrors.current}
                </p>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="new-pass">
                New password
              </label>
              <input
                id="new-pass"
                className="input"
                type="password"
                autoComplete="new-password"
                value={password.next}
                onChange={(e) => {
                  setPassword((p) => ({ ...p, next: e.target.value }));
                  setPasswordErrors((p) => ({ ...p, next: undefined }));
                }}
              />
              {passwordErrors.next && (
                <p className="hint" style={{ color: "#dc2626" }}>
                  {passwordErrors.next}
                </p>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="confirm-pass">
                Confirm new password
              </label>
              <input
                id="confirm-pass"
                className="input"
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                onChange={(e) => {
                  setPassword((p) => ({ ...p, confirm: e.target.value }));
                  setPasswordErrors((p) => ({ ...p, confirm: undefined }));
                }}
              />
              {passwordErrors.confirm && (
                <p className="hint" style={{ color: "#dc2626" }}>
                  {passwordErrors.confirm}
                </p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </div>
          </form>

          <div>
            <section className="card">
              <div className="switch-row">
                <div>
                  <div className="card-title">
                    <IconShield size={15} /> Two-Factor Authentication
                  </div>
                  <p className="card-desc">
                    Add an extra layer of system security to your Blogify
                    moderator account by requiring a code from your mobile
                    authenticator app.
                  </p>
                </div>
                <button
                  type="button"
                  className={`switch${twoFactor ? " on" : ""}`}
                  role="switch"
                  aria-checked={twoFactor}
                  aria-label="Toggle two-factor authentication"
                  onClick={() => {
                    setTwoFactor((v) => !v);
                    show(
                      twoFactor
                        ? "Two-factor authentication disabled."
                        : "Two-factor authentication enabled."
                    );
                  }}
                />
              </div>
            </section>

            <section className="card">
              <div className="card-title" style={{ marginBottom: 6 }}>
                Active Logged Sessions
              </div>
              {sessionList.map((session) => (
                <div className="session-row" key={session.id}>
                  <div>
                    <div className="session-name">{session.name}</div>
                    <div className="session-meta">{session.meta}</div>
                  </div>
                  <button
                    type="button"
                    className="link-danger"
                    onClick={() => {
                      setSessionList((prev) =>
                        prev.filter((s) => s.id !== session.id)
                      );
                      show("Session revoked successfully.");
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
              {sessionList.length === 0 && (
                <p className="card-desc">No other active sessions.</p>
              )}
            </section>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Email Notifications</div>
              <div className="card-desc">
                Choose which updates land in your inbox.
              </div>
            </div>
          </div>

          {prefs.map((pref) => (
            <div className="session-row" key={pref.id}>
              <div>
                <div className="session-name">{pref.title}</div>
                <div className="session-meta">{pref.desc}</div>
              </div>
              <button
                type="button"
                className={`switch${pref.on ? " on" : ""}`}
                role="switch"
                aria-checked={pref.on}
                aria-label={`Toggle ${pref.title}`}
                onClick={() =>
                  setPrefs((prev) =>
                    prev.map((p) => (p.id === pref.id ? { ...p, on: !p.on } : p))
                  )
                }
              />
            </div>
          ))}

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => show("Notification preferences saved.")}
            >
              <IconCheck size={16} />
              Save Preferences
            </button>
          </div>
        </section>
      )}

      {node}
    </AdminLayout>
  );
}
