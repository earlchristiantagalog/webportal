import type { Metadata } from "next";
import AdminShell from "./admin-shell";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | MNHS Web Portal",
  description: "Overview of the MNHS school web portal.",
};

type IconName =
  | "dashboard"
  | "people"
  | "book"
  | "calendar"
  | "chart"
  | "bell"
  | "arrow"
  | "logout"
  | "check";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
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
      <>
        <path d="M12 6c-3-2-6-2.5-10-1v15c4-1.5 7-1 10 1 3-2 6-2.5 10-1V5c-4-1.5-7-1-10 1ZM12 6v15" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 15h3M8 18h3" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V14M10 20V9M16 20V12M22 20V4M2 20h22" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4M8 12h10" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
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

const stats: {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: string;
}[] = [
  {
    label: "Total students",
    value: "1,248",
    detail: "+5.2% from last term",
    icon: "people",
    tone: "green",
  },
  {
    label: "Teaching staff",
    value: "84",
    detail: "Across 12 departments",
    icon: "book",
    tone: "blue",
  },
  {
    label: "Active classes",
    value: "42",
    detail: "This academic term",
    icon: "calendar",
    tone: "slate",
  },
  {
    label: "Attendance today",
    value: "94.8%",
    detail: "+2.1% from last week",
    icon: "check",
    tone: "amber",
  },
];

const attendance = [
  { month: "JAN", value: 82 },
  { month: "FEB", value: 87 },
  { month: "MAR", value: 84 },
  { month: "APR", value: 91 },
  { month: "MAY", value: 88 },
  { month: "JUN", value: 94 },
  { month: "JUL", value: 90 },
  { month: "AUG", value: 96 },
];

const activity = [
  {
    initials: "MR",
    name: "Maria Reyes",
    action: "Enrolled in Grade 10",
    date: "Today, 9:42 AM",
    status: "Completed",
    color: "mint",
  },
  {
    initials: "JD",
    name: "John Dela Cruz",
    action: "Updated student profile",
    date: "Today, 8:15 AM",
    status: "Updated",
    color: "amberAvatar",
  },
  {
    initials: "AC",
    name: "Ana Cruz",
    action: "Submitted enrollment form",
    date: "Yesterday, 3:30 PM",
    status: "Pending",
    color: "blueAvatar",
  },
  {
    initials: "MS",
    name: "Mark Santos",
    action: "Enrolled in Grade 8",
    date: "Yesterday, 11:06 AM",
    status: "Completed",
    color: "mint",
  },
];

export default function AdminDashboard() {
  return (
    <AdminShell active="dashboard" title="Dashboard">
      <div className={styles.content}>
        <div className={styles.intro}>
          <div>
            <h1>
              Welcome back, Admin <span aria-hidden="true">👋</span>
            </h1>
            <p>Here&apos;s what&apos;s happening at MNHS today.</p>
          </div>
          <span className={styles.demoBadge}>Sample dashboard data</span>
        </div>

        <section
          className="row g-3 g-xl-4"
          aria-label="School statistics"
          id="people"
        >
          {stats.map((stat) => (
            <div className="col-sm-6 col-xl-3" key={stat.label}>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles[stat.tone]}`}>
                  <Icon name={stat.icon} size={21} />
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statDetail}>{stat.detail}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="row g-3 g-xl-4 mt-1">
          <section
            className="col-xl-8"
            id="attendance"
            aria-labelledby="attendance-title"
          >
            <div className={`${styles.panel} ${styles.chartPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <h2 id="attendance-title">Attendance overview</h2>
                  <p>Monthly attendance rate across the school</p>
                </div>
                <span className={styles.panelTag}>2026</span>
              </div>
              <div className={styles.chartLegend}>
                <span /> Attendance rate
              </div>
              <div className={styles.chartBody}>
                <div className={styles.chartAxis}>
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                <div
                  className={styles.chartPlot}
                  role="img"
                  aria-label="Sample attendance rates from January to August: 82, 87, 84, 91, 88, 94, 90, and 96 percent."
                >
                  <div className={styles.chartLines} aria-hidden="true" />
                  {attendance.map((item, index) => (
                    <div className={styles.barColumn} key={item.month}>
                      <div
                        className={`${styles.bar} ${index === 7 ? styles.barHighlight : ""}`}
                        style={{ height: `${item.value * 1.78}px` }}
                        title={`${item.month}: ${item.value}%`}
                      />
                      <span>{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="col-xl-4" aria-labelledby="snapshot-title">
            <div className={`${styles.panel} ${styles.snapshotPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <h2 id="snapshot-title">Today at a glance</h2>
                  <p>Daily school snapshot</p>
                </div>
              </div>
              <div
                className={styles.donut}
                role="img"
                aria-label="94.8 percent of students present today"
              >
                <div>
                  <strong>94.8%</strong>
                  <span>Present today</span>
                </div>
              </div>
              <div className={styles.snapshotRows}>
                <div>
                  <span>
                    <i className={styles.greenDot} /> Present
                  </span>
                  <strong>1,183</strong>
                </div>
                <div>
                  <span>
                    <i className={styles.amberDot} /> Absent
                  </span>
                  <strong>65</strong>
                </div>
                <div>
                  <span>
                    <i className={styles.blueDot} /> Total students
                  </span>
                  <strong>1,248</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="row g-3 g-xl-4 mt-1">
          <section className="col-xl-8" aria-labelledby="activity-title">
            <div className={`${styles.panel} ${styles.activityPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <h2 id="activity-title">Recent activity</h2>
                  <p>Latest updates from your school community</p>
                </div>
                <span className={styles.panelTag}>This week</span>
              </div>
              <div className="table-responsive">
                <table
                  className={`table align-middle mb-0 ${styles.activityTable}`}
                >
                  <thead>
                    <tr>
                      <th scope="col">NAME</th>
                      <th scope="col">ACTIVITY</th>
                      <th scope="col">DATE</th>
                      <th scope="col">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((item) => (
                      <tr key={item.name}>
                        <td>
                          <span
                            className={`${styles.tableAvatar} ${styles[item.color]}`}
                          >
                            {item.initials}
                          </span>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{item.action}</td>
                        <td>{item.date}</td>
                        <td>
                          <span
                            className={`${styles.status} ${styles[item.status.toLowerCase()]}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section
            className="col-xl-4"
            id="updates"
            aria-labelledby="announcements-title"
          >
            <div className={`${styles.panel} ${styles.announcementsPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <h2 id="announcements-title">Announcements</h2>
                  <p>What&apos;s coming up next</p>
                </div>
              </div>
              <div className={styles.announcement}>
                <span className={styles.dateBox}>
                  <strong>30</strong>
                  <small>NOV</small>
                </span>
                <div>
                  <strong>Parent-teacher conference</strong>
                  <p>Meet with families to discuss student progress.</p>
                </div>
              </div>
              <div className={styles.announcement}>
                <span className={styles.dateBox}>
                  <strong>12</strong>
                  <small>DEC</small>
                </span>
                <div>
                  <strong>School foundation day</strong>
                  <p>Celebrating another year of learning together.</p>
                </div>
              </div>
              <div className={styles.announcement}>
                <span className={styles.dateBox}>
                  <strong>08</strong>
                  <small>JAN</small>
                </span>
                <div>
                  <strong>Quarterly assessment</strong>
                  <p>First quarter assessments begin.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <footer className={styles.footer}>
          MNHS Web Portal <span>•</span> Admin dashboard preview
        </footer>
      </div>
    </AdminShell>
  );
}
