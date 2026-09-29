export const Button = ({ children, type = "button", variant = "primary", onClick }: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
}) => {
  return (
    <button type={type} style={{ background: variant === "primary" ? "#3b82f6" : "transparent", color: variant === "primary" ? "white" : "#3b82f6", padding: "8px 16px", borderRadius: "4px", border: variant === "outline" ? "1px solid #3b82f6" : "none", cursor: "pointer", margin: "4px" }} onClick={onClick}>
      {children}
    </button>
  );
};