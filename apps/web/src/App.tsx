import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import BlogDetails from "./pages/BlogDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Media from "./pages/admin/Media";
import Tags from "./pages/admin/Tags";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";
import BlogsPage from "./pages/admin/BlogsPage";
import BlogCreate from "./pages/admin/BlogCreate";
import BlogEdit from "./pages/admin/BlogEdit";
import Categories from "./pages/admin/Categories";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages — accessible to everyone, no login required */}
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Pages */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/admin/blogs"
            element={<BlogsPage />}
          />
          <Route
            path="/admin/blogs/create"
            element={<BlogCreate />}
          />
          <Route
            path="/admin/blogs/edit/:id"
            element={<BlogEdit />}
          />
          <Route
            path="/admin/categories"
            element={<Categories />}
          />
          <Route
            path="/admin/media"
            element={<Media />}
          />
          <Route
            path="/admin/tags"
            element={<Tags />}
          />
          <Route
            path="/admin/profile"
            element={<Profile tab="info" />}
          />
          <Route
            path="/admin/profile/security"
            element={<Profile tab="security" />}
          />
          <Route
            path="/admin/profile/notifications"
            element={<Profile tab="notifications" />}
          />
          <Route
            path="/admin/settings"
            element={<Settings />}
          />
        </Route>

        {/* Unknown URL — send to public homepage */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
