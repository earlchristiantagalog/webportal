import type { Metadata } from "next";
import AdminShell from "../admin-shell";
import shellStyles from "../page.module.css";
import UsersManager from "./users-manager";
import styles from "./users.module.css";

export const metadata: Metadata = {
  title: "Users | MNHS Web Portal",
  description: "Manage MNHS student and teacher profiles.",
};

export default function UsersPage() {
  return (
    <AdminShell active="users" title="Users">
      <div className={shellStyles.content}>
        <div className={styles.intro}>
          <div>
            <h1>Users</h1>
            <p>Manage student and teacher profiles in one place.</p>
          </div>
        </div>
        <UsersManager />
      </div>
    </AdminShell>
  );
}
