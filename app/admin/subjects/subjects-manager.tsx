"use client";

import { useEffect, useState, type FormEvent } from "react";
import styles from "./subjects.module.css";

type Section = {
  id: string;
  grade: string;
  name: string;
  subjectCount: number;
};
type Subject = {
  id: string;
  sectionId: string;
  name: string;
  code: string;
  teacher: string;
};
type Notice = { message: string; variant: "success" | "warning" };

async function readResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "The request could not be completed. Please try again.";
    throw new Error(message);
  }
  return data as T;
}

async function loadData(signal?: AbortSignal) {
  const [sectionsResponse, subjectsResponse] = await Promise.all([
    fetch("/api/admin/sections", { cache: "no-store", signal }),
    fetch("/api/admin/subjects", { cache: "no-store", signal }),
  ]);
  const [{ sections }, { subjects }] = await Promise.all([
    readResponse<{ sections: Section[] }>(sectionsResponse),
    readResponse<{ subjects: Subject[] }>(subjectsResponse),
  ]);
  return { sections, subjects };
}

export default function SubjectsManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionGrade, setSectionGrade] = useState("Grade 7");
  const [sectionName, setSectionName] = useState("");
  const [sectionNotice, setSectionNotice] = useState<Notice | null>(null);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal)
      .then((data) => {
        setSections(data.sections);
        setSubjects(data.subjects);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load school data.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function retryLoad() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await loadData();
      setSections(data.sections);
      setSubjects(data.subjects);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load school data.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = sectionName.trim();
    if (!trimmedName || busy) return;
    setBusy(true);
    setSectionNotice(null);
    try {
      const { section } = await readResponse<{ section: Section }>(
        await fetch("/api/admin/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: sectionGrade, name: trimmedName }),
        }),
      );
      setSections((current) =>
        [...current, section].sort(
          (a, b) =>
            Number(a.grade.slice(6)) - Number(b.grade.slice(6)) ||
            a.name.localeCompare(b.name),
        ),
      );
      setSelectedSection(section.id);
      setSectionName("");
      setShowSectionForm(false);
      setSectionNotice({
        message: `${section.grade} – ${section.name} saved. You can now assign subjects to it.`,
        variant: "success",
      });
      setNotice(null);
    } catch (error) {
      setSectionNotice({
        message:
          error instanceof Error ? error.message : "Could not save section.",
        variant: "warning",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleAddSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subjectName = name.trim();
    const sectionId = sections.some((item) => item.id === selectedSection)
      ? selectedSection
      : sections[0]?.id;
    if (!subjectName || !sectionId || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const { subject } = await readResponse<{ subject: Subject }>(
        await fetch("/api/admin/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId,
            name: subjectName,
            teacher: teacher.trim(),
          }),
        }),
      );
      setSubjects((current) => [...current, subject]);
      setName("");
      setTeacher("");
      setNotice({
        message: `${subject.name} was saved with code ${subject.code}.`,
        variant: "success",
      });
    } catch (error) {
      setNotice({
        message:
          error instanceof Error ? error.message : "Could not save subject.",
        variant: "warning",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(subject: Subject) {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/admin/subjects/${encodeURIComponent(subject.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) await readResponse(response);
      setSubjects((current) =>
        current.filter((item) => item.id !== subject.id),
      );
      setNotice({
        message: `${subject.name} was removed from this section.`,
        variant: "success",
      });
    } catch (error) {
      setNotice({
        message:
          error instanceof Error ? error.message : "Could not remove subject.",
        variant: "warning",
      });
    } finally {
      setBusy(false);
    }
  }

  const activeSectionId = sections.some((item) => item.id === selectedSection)
    ? selectedSection
    : (sections[0]?.id ?? "");
  const section = sections.find((item) => item.id === activeSectionId);
  const visibleSubjects = subjects.filter(
    (item) => item.sectionId === activeSectionId,
  );
  const uniqueSubjects = new Set(
    subjects.map((item) => item.name.toLowerCase()),
  ).size;

  if (loading) {
    return (
      <div className={`card ${styles.loadingCard}`} role="status">
        <span
          className="spinner-border spinner-border-sm text-success"
          aria-hidden="true"
        />{" "}
        Loading sections and subjects...
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="alert alert-warning" role="alert">
        <strong>School data could not be loaded.</strong>
        <p className="mb-2 mt-1">{loadError}</p>
        <button
          type="button"
          className="btn btn-sm btn-outline-dark"
          onClick={retryLoad}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className={`card ${styles.metricCard}`}>
            <span>Class sections</span>
            <strong>{sections.length.toString().padStart(2, "0")}</strong>
            <small>
              Across {new Set(sections.map((item) => item.grade)).size} grade
              levels
            </small>
          </div>
        </div>
        <div className="col-sm-4">
          <div className={`card ${styles.metricCard}`}>
            <span>Unique subjects</span>
            <strong>{uniqueSubjects.toString().padStart(2, "0")}</strong>
            <small>In the current list</small>
          </div>
        </div>
        <div className="col-sm-4">
          <div className={`card ${styles.metricCard}`}>
            <span>Assignments</span>
            <strong>{subjects.length.toString().padStart(2, "0")}</strong>
            <small>Subjects across sections</small>
          </div>
        </div>
      </div>

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-4 col-xl-3">
          <section
            className={`card ${styles.sectionCard}`}
            aria-labelledby="sections-heading"
          >
            <div className={styles.cardHeading}>
              <div>
                <h2 id="sections-heading">Sections</h2>
                <p>{sections.length} class sections</p>
              </div>
              <button
                type="button"
                className={`btn btn-sm btn-outline-success ${styles.addSectionButton}`}
                aria-expanded={showSectionForm}
                aria-controls="add-section-form"
                disabled={busy}
                onClick={() => {
                  setShowSectionForm(!showSectionForm);
                  setSectionNotice(null);
                }}
              >
                <span aria-hidden="true">+</span> Add section
              </button>
            </div>
            {showSectionForm && (
              <form
                id="add-section-form"
                className={styles.sectionForm}
                onSubmit={handleAddSection}
              >
                <label htmlFor="section-grade" className="form-label">
                  Grade level
                </label>
                <select
                  id="section-grade"
                  className="form-select mb-3"
                  value={sectionGrade}
                  onChange={(event) => setSectionGrade(event.target.value)}
                  disabled={busy}
                >
                  {[7, 8, 9, 10, 11, 12].map((grade) => (
                    <option key={grade} value={`Grade ${grade}`}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
                <label htmlFor="section-name" className="form-label">
                  Section name
                </label>
                <input
                  id="section-name"
                  className="form-control"
                  value={sectionName}
                  onChange={(event) => setSectionName(event.target.value)}
                  placeholder="e.g. Narra"
                  maxLength={60}
                  required
                  disabled={busy}
                />
                <div className={styles.sectionFormActions}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={busy}
                    onClick={() => {
                      setShowSectionForm(false);
                      setSectionName("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-sm btn-success ${styles.saveSectionButton}`}
                    disabled={busy}
                  >
                    {busy ? "Saving..." : "Save section"}
                  </button>
                </div>
              </form>
            )}
            {sectionNotice && (
              <div
                className={`alert alert-${sectionNotice.variant} alert-dismissible ${styles.sectionNotice}`}
                role="alert"
              >
                {sectionNotice.message}
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close alert"
                  onClick={() => setSectionNotice(null)}
                />
              </div>
            )}
            <div className="list-group list-group-flush">
              {sections.map((item) => {
                const selected = item.id === activeSectionId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    className={`list-group-item list-group-item-action ${styles.sectionButton} ${selected ? styles.sectionButtonActive : ""}`}
                    onClick={() => {
                      setSelectedSection(item.id);
                      setNotice(null);
                      setSectionNotice(null);
                    }}
                  >
                    <span className={styles.sectionAvatar}>
                      {item.grade.replace("Grade ", "")}
                    </span>
                    <span className={styles.sectionText}>
                      <strong>{item.name}</strong>
                      <small>{item.grade}</small>
                    </span>
                    <span
                      className={`badge rounded-pill ${styles.sectionCount}`}
                    >
                      {
                        subjects.filter(
                          (subject) => subject.sectionId === item.id,
                        ).length
                      }
                    </span>
                  </button>
                );
              })}
              {!sections.length && (
                <div className={styles.sectionHint}>
                  No sections yet. Add a section to get started.
                </div>
              )}
            </div>
            {!!sections.length && (
              <div className={styles.sectionHint}>
                Choose a section to see its assigned subjects.
              </div>
            )}
          </section>
        </div>

        <div className="col-lg-8 col-xl-9">
          <section
            className={`card ${styles.formCard}`}
            aria-labelledby="add-subject-heading"
          >
            <div className={styles.cardHeading}>
              <div>
                <h2 id="add-subject-heading">Add a subject</h2>
                <p>Assign a new subject to a class section</p>
              </div>
              <span className={styles.formIcon} aria-hidden="true">
                +
              </span>
            </div>
            <form onSubmit={handleAddSubject} className={styles.formBody}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="section" className="form-label">
                    Section <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="section"
                    className="form-select"
                    value={activeSectionId}
                    onChange={(event) => {
                      setSelectedSection(event.target.value);
                      setNotice(null);
                      setSectionNotice(null);
                    }}
                    required
                    disabled={!sections.length || busy}
                  >
                    {!sections.length && (
                      <option value="">Add a section first</option>
                    )}
                    {sections.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.grade} – {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="subject-name" className="form-label">
                    Subject name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="subject-name"
                    className="form-control"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Mathematics"
                    maxLength={80}
                    required
                    disabled={!sections.length || busy}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="subject-code" className="form-label">
                    Subject code
                  </label>
                  <input
                    id="subject-code"
                    className={`form-control ${styles.generatedCode}`}
                    value="Generated after saving (26XXX)"
                    readOnly
                    aria-describedby="subject-code-help"
                  />
                  <small id="subject-code-help" className={styles.codeHelp}>
                    A unique five-digit code is assigned on submission.
                  </small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="teacher" className="form-label">
                    Teacher <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id="teacher"
                    className="form-control"
                    value={teacher}
                    onChange={(event) => setTeacher(event.target.value)}
                    placeholder="e.g. Ms. A. Reyes"
                    maxLength={80}
                    disabled={!sections.length || busy}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <span>Fields marked * are required.</span>
                <button
                  type="submit"
                  className={`btn btn-success ${styles.addButton}`}
                  disabled={!sections.length || busy}
                >
                  <span aria-hidden="true">+</span>{" "}
                  {busy ? "Saving..." : "Add subject"}
                </button>
              </div>
            </form>
          </section>

          {notice && (
            <div
              className={`alert alert-${notice.variant} alert-dismissible ${styles.notice}`}
              role="alert"
            >
              {notice.message}
              <button
                type="button"
                className="btn-close"
                aria-label="Close alert"
                onClick={() => setNotice(null)}
              />
            </div>
          )}

          <section
            className={`card ${styles.tableCard}`}
            aria-labelledby="assigned-heading"
          >
            <div className={styles.cardHeading}>
              <div>
                <h2 id="assigned-heading">Assigned subjects</h2>
                <p>
                  {section
                    ? `${section.grade} – ${section.name}`
                    : "Add a section first"}
                </p>
              </div>
              <span className={`badge rounded-pill ${styles.assignedBadge}`}>
                {visibleSubjects.length} subjects
              </span>
            </div>
            {visibleSubjects.length ? (
              <div className="table-responsive">
                <table
                  className={`table table-hover align-middle mb-0 ${styles.subjectTable}`}
                >
                  <thead>
                    <tr>
                      <th scope="col">SUBJECT</th>
                      <th scope="col">CODE</th>
                      <th scope="col">TEACHER</th>
                      <th scope="col">
                        <span className="visually-hidden">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSubjects.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>
                          <span className={`badge ${styles.codeBadge}`}>
                            {item.code}
                          </span>
                        </td>
                        <td>
                          {item.teacher || (
                            <span className={styles.unassigned}>
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className={`btn btn-sm btn-outline-secondary ${styles.removeButton}`}
                            aria-label={`Remove ${item.name} from ${section?.name}`}
                            disabled={busy}
                            onClick={() => handleRemove(item)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span aria-hidden="true">▤</span>
                <strong>No subjects assigned yet</strong>
                <p>
                  {section
                    ? `Use the form above to add the first subject for ${section.name}.`
                    : "Add a section, then assign its first subject."}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
