import { Navigate, Outlet } from "react-router-dom";
import { hasToken } from "../services/api";
import { AdminProvider } from "../hooks/useAdmin";

function ProtectedRoute() {
  // Requires a real token. The previous check also accepted a bare
  // `isAuthenticated` localStorage flag, which anyone could set by hand.
  if (!hasToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  /*
   * The admin identity provider lives here rather than inside `AdminLayout`.
   * Each page renders `<AdminLayout>` as its own child, so a page calling
   * `useAdmin()` sits above a provider mounted down there and receives the
   * context default instead of the real name. `ProtectedRoute` wraps every
   * admin route, so mounting here puts the provider above all of them.
   */
  return (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  );
}

export default ProtectedRoute;
