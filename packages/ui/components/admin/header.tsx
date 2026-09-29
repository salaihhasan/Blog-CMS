export const Header = () => {
  return (
    <header style={{
      background: "#f8fafc",
      padding: "0 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "64px",
      borderBottom: "1px solid #e2e8f0"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>
          Blog CMS
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#64748b", fontSize: "14px" }}>Admin</span>
        <button style={{
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          padding: "8px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          cursor: "pointer",
          fontFamily: "inherit"
        }}>
          Logout
        </button>
      </div>
    </header>
  );
};