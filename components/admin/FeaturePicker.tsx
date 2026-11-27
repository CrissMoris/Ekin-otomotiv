"use client";

import { FEATURE_GROUP_KEYS, FEATURE_GROUPS } from "@/lib/vehicle-specs";

/** Donanım özellikleri: tıklayarak seç / kaldır. */
export function FeaturePicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const toggle = (key: string) => onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div className="feature-picker">
      {FEATURE_GROUP_KEYS.map((g) => {
        const items = Object.entries(FEATURE_GROUPS[g].items);
        const count = items.filter(([k]) => value.includes(k)).length;
        return (
          <fieldset key={g} className="feature-group">
            <legend>
              {FEATURE_GROUPS[g].tr} <span className="muted">({count}/{items.length})</span>
            </legend>
            <div className="check-pills">
              {items.map(([key, label]) => (
                <label key={key} className={`check-pill${value.includes(key) ? " active" : ""}`}>
                  <input type="checkbox" checked={value.includes(key)} onChange={() => toggle(key)} />
                  <span>{label.tr}</span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
