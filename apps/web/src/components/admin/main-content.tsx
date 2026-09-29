export const MainContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`admin-body ${className}`.trim()}>{children}</div>;
};
