import Link from "next/link";
export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/create" className="brand">
          AI Product Jira Agent
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/create">Create</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
