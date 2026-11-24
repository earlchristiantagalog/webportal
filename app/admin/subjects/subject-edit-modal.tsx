"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Section, Subject } from "./types";
import WeekdayPicker from "./weekday-picker";
import styles from "./subjects.module.css";

type EditForm = {
  sectionId: string;
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
};

export default function SubjectEditModal({
  subject,
  sections,
  onSaved,
  onClose,
}: {
  subject: Subject;
  sections: Section[];
  onSaved: (updated: Subject) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<EditForm>({
    sectionId: subject.sectionId,
    name: subject.name,
    days: subject.days,
    startTime: subject.startTime ?? "",
    endTime: subject.endTime ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!form.days.length) {
      setError("Choose at least one school weekday.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setError("End time must be later than start time.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/subjects/${encodeURIComponent(subject.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result &&
            typeof result === "object" &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Could not update the subject.",
        );
      }
      const updated = (result as { subject: Subject }).subject;
      onSaved(updated);
      dialogRef.current?.close();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update the subject.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.editDialog}
      aria-labelledby="edit-subject-title"
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
    >
      <div className={styles.editContent}>
        <div className="modal-header">
          <div>
            <h2 id="edit-subject-title" className="modal-title">
              Edit subject
            </h2>
            <p className={styles.editSubtitle}>
              Update this subject&apos;s assignment and schedule.
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close edit subject"
            disabled={busy}
            onClick={() => dialogRef.current?.close()}
          />
        </div>
        <form onSubmit={save}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            )}
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label" htmlFor="edit-subject-section">
                  Section *
                </label>
                <select
                  id="edit-subject-section"
                  className="form-select"
                  value={form.sectionId}
                  onChange={(event) =>
                    setForm({ ...form, sectionId: event.target.value })
                  }
                  disabled={busy}
                  required
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.grade} – {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="edit-subject-name">
                  Subject name *
                </label>
                <input
                  id="edit-subject-name"
                  className="form-control"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  maxLength={80}
                  required
                  disabled={busy}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="edit-subject-code">
                  Subject code
                </label>
                <input
                  id="edit-subject-code"
                  className="form-control"
                  value={subject.code}
                  readOnly
                  aria-describedby="edit-subject-code-help"
                />
                <small id="edit-subject-code-help" className={styles.codeHelp}>
                  The generated code cannot be changed.
                </small>
              </div>
              <div className="col-sm-6">
                <WeekdayPicker
                  id="edit-subject"
                  days={form.days}
                  onChange={(days) =>
                    setForm((current) => ({ ...current, days }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="edit-subject-start">
                  Start time *
                </label>
                <input
                  id="edit-subject-start"
                  type="time"
                  className="form-control"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm({ ...form, startTime: event.target.value })
                  }
                  required
                  disabled={busy}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="edit-subject-end">
                  End time *
                </label>
                <input
                  id="edit-subject-end"
                  type="time"
                  className="form-control"
                  value={form.endTime}
                  onChange={(event) =>
                    setForm({ ...form, endTime: event.target.value })
                  }
                  required
                  disabled={busy}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary mx-2"
              disabled={busy}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-success ${styles.addButton}`}
              disabled={busy}
            >
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
