import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./page.module.css";

function NavIcon({
  name,
}: {
  name: "dashboard" | "people" | "book" | "calendar" | "logout";
}) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1h-3" />
      </>
    ),
    book: (
      <path d="M12 6c-3-2-6-2.5-10-1v15c4-1.5 7-1 10 1 3-2 6-2.5 10-1V5c-4-1.5-7-1-10 1ZM12 6v15" />
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 15h3M8 18h3" />
      </>
    ),
    logout: (
      <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4M8 12h10" />
    ),
  };
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const pages = [
  { label: "Dashboard", href: "/admin", icon: "dashboard", key: "dashboard" },
  { label: "Subjects", href: "/admin/subjects", icon: "book", key: "subjects" },
  { label: "Users", href: "/admin/users", icon: "people", key: "users" },
] as const;

export default function AdminShell({
  active,
  title,
  children,
}: {
  active: "dashboard" | "subjects" | "users";
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Admin navigation">
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <NavIcon name="book" />
          </span>
        </div>
        <div className={styles.sidebarContent}>
          <nav className={styles.nav} aria-label="Admin pages">
            {pages.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-label={item.label}
                aria-current={active === item.key ? "page" : undefined}
                className={`${styles.navLink} ${active === item.key ? styles.navLinkActive : ""}`}
              >
                <NavIcon name={item.icon} />
                <span className={styles.navTooltip} aria-hidden="true">
                  {item.label}
                </span>
              </Link>
            ))}
            <span
              className={`${styles.navLink} ${styles.navDisabled}`}
              role="img"
              aria-label="Schedule, coming soon"
              title="Schedule — coming soon"
            >
              <NavIcon name="calendar" />
              <span className={styles.navTooltip} aria-hidden="true">
                Schedule · coming soon
              </span>
            </span>
          </nav>
          <div className={styles.sidebarSpacer} />
          <Link href="/" aria-label="Back to login" className={styles.backLink}>
            <NavIcon name="logout" />
            <span className={styles.navTooltip} aria-hidden="true">
              Back to login
            </span>
          </Link>
        </div>
      </aside>
      <main
        className={styles.main}
        id={active === "dashboard" ? "overview" : undefined}
      >
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}></div>
          <div className={styles.topbarRight}>
            <span className={styles.academicYear}>
              School Year 2026–2027 | TERM 1
            </span>
            <div className={styles.profile}>
              <span className={styles.profileAvatar}>AD</span>
              <span>
                <strong>Administrator</strong>
                <small>School Admin</small>
              </span>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
