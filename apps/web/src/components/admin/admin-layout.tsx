import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MainContent } from "./main-content";
import "../../styles/admin.css";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="admin-main">
        <Header onMenu={() => setOpen(true)} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};
