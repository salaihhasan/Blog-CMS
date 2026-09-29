import type { MouseEvent } from "react";

export function goToSection(
  e: MouseEvent,
  id: string,
  pathname: string,
  navigate: (path: string) => void
) {
  e.preventDefault();
  if (pathname === "/") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  navigate("/");
  window.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, 150);
}
