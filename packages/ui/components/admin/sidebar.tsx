export const Sidebar = () => {
  return (
    <nav style={{
      width: "250px",
      background: "#1e293b",
      color: "white",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      borderRight: "1px solid #334155"
    }}>
      <div style={{
        fontSize: "20px", 
        fontWeight: "bold", 
        marginBottom: "24px",
        paddingBottom: "12px",
        borderBottom: "1px solid #334155"
      }}>Blog CMS Admin</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li>
          <a href="/admin/dashboard" style={{
            color: "white",
            textDecoration: "none",
            fontSize: "15px",
            padding: "8px 12px",
            borderRadius: "6px",
            display: "block",
            marginBottom: "2px",
            fontWeight: 500
          }}>Dashboard</a>
        </li>
        <li>
          <a href="/admin/blogs" style={{
            color: "#cbd5e1",
            textDecoration: "none",
            fontSize: "15px",
            padding: "8px 12px",
            borderRadius: "6px",
            display: "block",
            marginBottom: "2px"
          }}>Blogs</a>
        </li>
        <li>
          <a href="/admin/create-blog" style={{
            color: "#cbd5e1",
            textDecoration: "none",
            fontSize: "15px",
            padding: "8px 12px",
            borderRadius: "6px",
            display: "block",
            marginBottom: "2px"
          }}>Create Blog</a>
        </li>
        <li>
          <a href="/admin/categories" style={{
            color: "#cbd5e1",
            textDecoration: "none",
            fontSize: "15px",
            padding: "8px 12px",
            borderRadius: "6px",
            display: "block",
            marginBottom: "2px"
          }}>Categories</a>
        </li>
        <li>
          <a href="/admin/login" style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "15px",
            padding: "8px 12px",
            borderRadius: "6px",
            display: "block",
            marginBottom: "2px",
            fontWeight: 500,
            background: "transparent"
          }}>Login</a>
        </li>
      </ul>
    </nav>
  );
};