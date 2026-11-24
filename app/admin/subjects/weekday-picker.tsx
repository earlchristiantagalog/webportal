"use client";

import styles from "./subjects.module.css";

export const schoolDays = [
  { value: "MON", label: "M", name: "Monday" },
  { value: "TUE", label: "T", name: "Tuesday" },
  { value: "WED", label: "W", name: "Wednesday" },
  { value: "THU", label: "TH", name: "Thursday" },
  { value: "FRI", label: "F", name: "Friday" },
] as const;

export function formatSchoolDays(days: string[]) {
  return schoolDays.filter((day) => days.includes(day.value)).map((day) => day.label).join(" · ");
}

export default function WeekdayPicker({
  id,
  days,
  onChange,
  disabled = false,
}: {
  id: string;
  days: string[];
  onChange: (days: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className={styles.weekdayFieldset} disabled={disabled}>
      <legend className="form-label">Days <span className={styles.required}>*</span></legend>
      <div className={styles.weekdayPicker}>
        {schoolDays.map((day) => (
          <label key={day.value} className={styles.weekdayOption} title={day.name}>
            <input
              type="checkbox"
              name={`${id}-days`}
              value={day.value}
              aria-label={day.name}
              checked={days.includes(day.value)}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...days, day.value]
                  : days.filter((value) => value !== day.value);
                onChange(schoolDays.filter((value) => next.includes(value.value)).map((value) => value.value));
              }}
            />
            <span>{day.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
