import type { Metadata } from "next";
import AdminShell from "../admin-shell";
import SubjectsManager from "./subjects-manager";
import shellStyles from "../page.module.css";
import styles from "./subjects.module.css";

export const metadata: Metadata = {
  title: "Subjects | MNHS Web Portal",
  description: "Assign and manage subjects for MNHS sections.",
};

export default function SubjectsPage() {
  return (
    <AdminShell active="subjects" title="Subjects">
      <div className={shellStyles.content}>
        <div className={styles.intro}>
          <div>
            <h1>Subjects &amp; sections</h1>
            <p>Organize the subjects taught in each class section.</p>
          </div>
        </div>
        <SubjectsManager />
      </div>
    </AdminShell>
  );
}
