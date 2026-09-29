export const Input = ({ type = "text", placeholder, value, onChange }: {
  type?: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "16px", margin: "4px" }} />
  );
};