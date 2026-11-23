"use client";

import styles from "./page.module.css";

export default function LogoutButton({ children }: { children: React.ReactNode }) {
  async function logout() {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } finally {
      window.location.replace("/");
    }
  }
  return <button type="button" onClick={logout} aria-label="Sign out" className={styles.backLink}>
    {children}
  </button>;
}
