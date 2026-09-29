import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../../services/api";
import { useAdmin } from "../../hooks/useAdmin";
import {
  IconBook,
  IconClose,
  IconDashboard,
  IconFolder,
  IconGear,
  IconLogout,
  IconMedia,
  IconPosts,
  IconTag,
} from "./icons";

// "Create Post" is deliberately absent — it is reached from the Posts page,
// which already has a Create Post button, so it does not need its own entry.
const items = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: IconDashboard },
  { to: "/admin/blogs", label: "Posts", Icon: IconPosts },
  { to: "/admin/media", label: "Media", Icon: IconMedia },
  { to: "/admin/categories", label: "Categories", Icon: IconFolder },
  { to: "/admin/tags", label: "Tags", Icon: IconTag },
  { to: "/admin/settings", label: "Settings", Icon: IconGear },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { name: adminName, initials } = useAdmin();

  const logout = () => {
    clearSession();
    onClose();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          type="button"
          className="admin-overlay"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="side-brand">
          <span className="side-mark">
            <IconBook size={15} />
          </span>
          <span className="side-name">Blogify</span>
          <button
            type="button"
            className="ghost-icon side-close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <IconClose size={17} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Admin navigation">
          {items.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `side-link${isActive ? " active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="side-spacer" />

        <div className="side-user">
          <span className="avatar">
            {initials}
          </span>
          <div className="side-user-meta">
            <div className="side-user-name">{adminName}</div>
            <div className="side-user-role">Admin</div>
          </div>
        </div>

        <button type="button" className="side-link side-logout" onClick={logout}>
          <IconLogout size={17} />
          Logout
        </button>
      </aside>
    </>
  );
};
