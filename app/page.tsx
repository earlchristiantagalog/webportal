"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<{ message: string; variant: "info" | "warning" } | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signingIn) return;
    const form = new FormData(event.currentTarget);
    setSigningIn(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error : "Sign in failed. Please try again.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "Sign in failed. Please try again.", variant: "warning" });
      setSigningIn(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundCircleOne} aria-hidden="true" />
      <div className={styles.backgroundCircleTwo} aria-hidden="true" />

      <div className={`container ${styles.container}`}>
        <section className={`card ${styles.loginCard}`} aria-labelledby="login-title">
          <div className={styles.cardTop}>
            <h1 id="login-title" className="text-center">MNHS <span>WEB PORTAL</span></h1>
          </div>

          <div className={styles.cardBody}>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="email" className={`form-label ${styles.label}`}>School email</label>
                <div className={styles.inputWrap}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  <input id="email" name="email" type="email" className={`form-control ${styles.input}`} placeholder="name@school.edu" autoComplete="username" required />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={`form-label ${styles.label}`}>Password</label>
                <div className={styles.inputWrap}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} className={`form-control ${styles.input} ${styles.passwordInput}`} placeholder="Enter your password" autoComplete="current-password" required />
                  <button type="button" className={styles.visibilityButton} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M8.4 5.4A10.8 10.8 0 0 1 12 4.8c5 0 8.6 4.2 9.7 7.2a11.7 11.7 0 0 1-3.3 4.5M6 6A12.3 12.3 0 0 0 2.3 12c1.1 3 4.7 7.2 9.7 7.2 1.3 0 2.6-.3 3.7-.8" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.3 12S5.7 4.8 12 4.8 21.7 12 21.7 12 18.3 19.2 12 19.2 2.3 12 2.3 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.formOptions}>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember" name="remember" />
                  <label className="form-check-label" htmlFor="remember">Remember me</label>
                </div>
                <button type="button" className={styles.textButton} onClick={() => setNotice({ message: "Password reset is not configured yet. Please contact your school's IT support team.", variant: "warning" })}>Forgot password?</button>
              </div>

              <button type="submit" className={`btn w-100 ${styles.submitButton}`} disabled={signingIn}>{signingIn ? "Signing in..." : "Sign in"} <span aria-hidden="true">→</span></button>
            </form>

            {notice && (
              <div className={`alert alert-${notice.variant} alert-dismissible ${styles.notice}`} role="alert">
                {notice.message}
                <button type="button" className="btn-close" aria-label="Close alert" onClick={() => setNotice(null)} />
              </div>
            )}

            <div className={styles.cardFooter}>
              <span className={styles.helpIcon} aria-hidden="true">?</span>
              <span>Having trouble signing in? <button type="button" className={styles.textButton} onClick={() => setNotice({ message: "Please contact your school's IT support team for help accessing your account.", variant: "info" })}>Get help</button></span>
            </div>
            <p className={styles.previewLink}>Explore the <Link href="/teacher">Teachers Portal preview →</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
