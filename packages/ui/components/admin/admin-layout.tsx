import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MainContent } from "./main-content";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden"
    }}>
      <Sidebar />
      <Header />
      <MainContent>{children}</MainContent>
    </div>
  );
};