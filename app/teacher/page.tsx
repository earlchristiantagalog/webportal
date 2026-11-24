import type { Metadata } from "next";
import Link from "next/link";
import styles from "./teacher.module.css";

export const metadata: Metadata = {
  title: "Teacher Portal | MNHS Web Portal",
  description: "Preview the MNHS teacher workspace.",
};

type IconName = "grid" | "book" | "calendar" | "bell" | "arrow" | "clock" | "users" | "check";

function Icon({ name, size = 19 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M12 6c-3-2-6-2.5-10-1v15c4-1.5 7-1 10 1 3-2 6-2.5 10-1V5c-4-1.5-7-1-10 1ZM12 6v15" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1h-3" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const classes = [
  { grade: "07", section: "Rizal", subject: "Mathematics 7", time: "Mon–Fri · 8:00–8:50 AM", tone: "green" },
  { grade: "08", section: "Bonifacio", subject: "Mathematics 8", time: "Mon–Fri · 10:00–10:50 AM", tone: "blue" },
  { grade: "09", section: "Mabini", subject: "Mathematics 9", time: "Mon–Fri · 1:00–1:50 PM", tone: "amber" },
] as const;

const schedule = [
  { time: "08:00", end: "08:50 AM", title: "Mathematics 7", place: "Grade 7 – Rizal", room: "Room 201", tone: "green" },
  { time: "10:00", end: "10:50 AM", title: "Mathematics 8", place: "Grade 8 – Bonifacio", room: "Room 203", tone: "blue" },
  { time: "01:00", end: "01:50 PM", title: "Mathematics 9", place: "Grade 9 – Mabini", room: "Room 205", tone: "amber" },
] as const;

export default function TeacherPortal() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Teacher navigation">
        <div className={styles.brand}>
          <span className={styles.brandMark}><Icon name="book" size={23} /></span>
          <span>MNHS <strong>PORTAL</strong><small>TEACHER WORKSPACE</small></span>
        </div>
        <div className={styles.navLabel}>WORKSPACE</div>
        <nav className={styles.nav} aria-label="Teacher sections">
          <a href="#overview" className={styles.navActive}><Icon name="grid" /> Overview</a>
          <a href="#classes"><Icon name="book" /> My classes</a>
          <a href="#schedule"><Icon name="calendar" /> Schedule</a>
          <a href="#announcements"><Icon name="bell" /> Announcements</a>
        </nav>
        <div className={styles.sideBottom}>
          <div className={styles.sideNote}><span className={styles.noteDot} /> Preview workspace <small>Sample data only</small></div>
          <Link href="/" className={styles.backLink}>← Back to sign in</Link>
        </div>
      </aside>

      <main className={styles.main} id="overview">
        <header className={styles.topbar}>
          <div><span className={styles.crumb}>Workspace</span><span className={styles.slash}>/</span><strong>Overview</strong></div>
          <div className={styles.topRight}><span className={styles.schoolYear}>SY 2026–2027</span><span className={styles.profileAvatar}>TC</span><span className={styles.profileName}>Teacher <small>Preview account</small></span></div>
        </header>
        <div className={styles.content}>
          <div className={styles.heading}>
            <div><span className={styles.eyebrow}><i /> TEACHER DASHBOARD</span><h1>Your teaching space</h1><p>An overview of your classes, schedule, and school updates.</p></div>
            <span className={styles.previewBadge}>Dashboard preview · Sample data</span>
          </div>

          <section className={styles.welcome} aria-label="Welcome">
            <div className={styles.welcomeContent}>
              <span className={styles.welcomeTag}>A NEW DAY TO INSPIRE</span>
              <h2>Good to see you, Teacher.</h2>
              <p>Everything you need for the school day, together in one place. Your classroom starts here.</p>
              <a href="#schedule" className={styles.welcomeLink}>View sample schedule <Icon name="arrow" size={17} /></a>
            </div>
            <div className={styles.welcomeArt} aria-hidden="true"><div className={styles.orbOne} /><div className={styles.orbTwo} /><div className={styles.artCard}><Icon name="book" size={44} /><span>TEACH • LEARN • GROW</span></div></div>
          </section>

          <div className="row g-3 g-xl-4 mt-1" aria-label="Sample overview">
            <div className="col-sm-6 col-xl-3"><div className={styles.stat}><span className={`${styles.statIcon} ${styles.green}`}><Icon name="book" /></span><span>My classes</span><strong>03</strong><small>Sample class assignments</small></div></div>
            <div className="col-sm-6 col-xl-3"><div className={styles.stat}><span className={`${styles.statIcon} ${styles.blue}`}><Icon name="calendar" /></span><span>Sessions today</span><strong>03</strong><small>Across three grade levels</small></div></div>
            <div className="col-sm-6 col-xl-3"><div className={styles.stat}><span className={`${styles.statIcon} ${styles.amber}`}><Icon name="clock" /></span><span>Teaching hours</span><strong>2.5</strong><small>Hours on the sample schedule</small></div></div>
            <div className="col-sm-6 col-xl-3"><div className={styles.stat}><span className={`${styles.statIcon} ${styles.slate}`}><Icon name="check" /></span><span>School year</span><strong>26–27</strong><small>Academic year overview</small></div></div>
          </div>

          <div className="row g-3 g-xl-4 mt-2">
            <section id="schedule" className="col-xl-8" aria-labelledby="schedule-title">
              <div className={styles.panel}>
                <div className={styles.panelHeading}><div><span className={styles.sectionLabel}>THE DAY AHEAD</span><h2 id="schedule-title">Sample schedule</h2><p>A look at a typical teaching day</p></div><span className={styles.panelPill}>3 sessions</span></div>
                <div className={styles.timeline}>{schedule.map((item) => <div className={styles.session} key={item.title}>
                  <div className={styles.sessionTime}><strong>{item.time}</strong><span>{item.end}</span></div>
                  <span className={`${styles.sessionRail} ${styles[item.tone]}`} aria-hidden="true" />
                  <div className={styles.sessionBody}><strong>{item.title}</strong><span>{item.place}</span></div>
                  <span className={styles.room}>{item.room}</span>
                </div>)}</div>
                <div className={styles.panelFooter}>Timetable shown is illustrative, not a live schedule.</div>
              </div>
            </section>
            <section id="announcements" className="col-xl-4" aria-labelledby="updates-title">
              <div className={`${styles.panel} ${styles.updatesPanel}`}>
                <div className={styles.panelHeading}><div><span className={styles.sectionLabel}>STAY IN THE LOOP</span><h2 id="updates-title">Announcements</h2><p>Sample school notices</p></div></div>
                <div className={styles.announcement}><span className={`${styles.announcementIcon} ${styles.green}`}><Icon name="bell" size={18} /></span><div><strong>Faculty meeting</strong><p>Planning and school updates for the teaching team.</p><small>Sample notice</small></div></div>
                <div className={styles.announcement}><span className={`${styles.announcementIcon} ${styles.amber}`}><Icon name="calendar" size={18} /></span><div><strong>Quarterly assessment</strong><p>Prepare learning materials for the upcoming assessment period.</p><small>Sample notice</small></div></div>
                <div className={styles.announcement}><span className={`${styles.announcementIcon} ${styles.blue}`}><Icon name="users" size={18} /></span><div><strong>Parent-teacher conference</strong><p>A chance to connect with families and share progress.</p><small>Sample notice</small></div></div>
              </div>
            </section>
          </div>

          <section id="classes" className={styles.classesPanel} aria-labelledby="classes-title">
            <div className={styles.panelHeading}><div><span className={styles.sectionLabel}>YOUR CLASSROOMS</span><h2 id="classes-title">Sample classes</h2><p>Example subjects and sections for the teacher workspace</p></div><span className={styles.panelPill}>SY 2026–2027</span></div>
            <div className="row g-3">{classes.map((item) => <div className="col-md-4" key={item.section}><div className={styles.classCard}><div className={styles.classTop}><span className={`${styles.gradeIcon} ${styles[item.tone]}`}>{item.grade}</span><span className={styles.classType}>CLASS SECTION</span></div><strong>{item.subject}</strong><p>Grade {Number(item.grade)} – {item.section}</p><div className={styles.classTime}><Icon name="clock" size={15} />{item.time}</div></div></div>)}</div>
          </section>
          <footer className={styles.footer}>MNHS Web Portal <span>•</span> Teacher dashboard preview. Sign-in, class rosters, and live teaching tools are not connected yet.</footer>
        </div>
      </main>
    </div>
  );
}
