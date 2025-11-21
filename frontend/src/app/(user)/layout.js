import NavbarWrapper from "./_components/NavbarWrapper";
export default function UserLayout({ children }) {
  return (
    <div>
      <NavbarWrapper />
      {children}
    </div>
  );
}
