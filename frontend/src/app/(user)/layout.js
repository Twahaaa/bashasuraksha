import NavbarWrapper from "./_components/NavbarWrapper";
export default function UserLayout({ children }) {
  return (
    <div className="pt-22">
      <NavbarWrapper />
      {children}
    </div>
  );
}
