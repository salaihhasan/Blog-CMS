export const MainContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <main style={{
      marginLeft: "250px",
      padding: "24px",
      minHeight: "calc(100vh - 64px)",
      width: "100%"
    }}>
      {children}
    </main>
  );
};