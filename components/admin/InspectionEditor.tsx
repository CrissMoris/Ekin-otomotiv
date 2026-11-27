"use client";

import { InspectionDiagram } from "@/components/site/InspectionDiagram";
import {
  BODY_PART_KEYS,
  BODY_PARTS,
  PART_STATE_KEYS,
  PART_STATES,
  type BodyPart,
  type Inspection,
  type PartState,
} from "@/lib/vehicle-specs";

/** Ekspertiz: şemadaki parçaya tıklamak durumu sırayla değiştirir; listeden de doğrudan seçilebilir. */
export function InspectionEditor({ value, onChange }: { value: Inspection; onChange: (next: Inspection) => void }) {
  const setPart = (part: BodyPart, state: PartState | null) => {
    const next = { ...value };
    if (state) next[part] = state;
    else delete next[part];
    onChange(next);
  };

  const cycle = (part: BodyPart) => {
    const current = value[part];
    const i = current ? PART_STATE_KEYS.indexOf(current) : -1;
    setPart(part, i + 1 < PART_STATE_KEYS.length ? PART_STATE_KEYS[i + 1] : null);
  };

  return (
    <div className="inspection-editor">
      <div className="inspection-editor-diagram">
        <InspectionDiagram inspection={value} notSpecified="Belirtilmemiş" onPartClick={cycle} />
        <ul className="inspection-legend">
          {PART_STATE_KEYS.map((s) => (
            <li key={s}>
              <i className="swatch" style={{ background: PART_STATES[s].color, color: PART_STATES[s].ink }}>
                {PART_STATES[s].abbr.tr}
              </i>{" "}
              {PART_STATES[s].tr}
            </li>
          ))}
          <li>
            <i className="swatch legend-empty" /> Belirtilmemiş
          </li>
        </ul>
        <p className="hint">Şemadaki parçaya her tıklamada durum sırayla değişir.</p>
      </div>
      <div>
        <div className="inspection-quick">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onChange(Object.fromEntries(BODY_PART_KEYS.map((p) => [p, value[p] ?? "orijinal"])) as Inspection)}
          >
            Boş parçaları orijinal yap
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange({})}>
            Temizle
          </button>
        </div>
        <ul className="inspection-rows">
          {BODY_PART_KEYS.map((p) => (
            <li key={p}>
              <span>{BODY_PARTS[p].tr}</span>
              <div className="state-pills" role="group" aria-label={BODY_PARTS[p].tr}>
                {PART_STATE_KEYS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`state-pill${value[p] === s ? " active" : ""}`}
                    style={
                      value[p] === s
                        ? {
                            background: PART_STATES[s].color,
                            borderColor: PART_STATES[s].color,
                            color: PART_STATES[s].ink,
                          }
                        : undefined
                    }
                    aria-pressed={value[p] === s}
                    onClick={() => setPart(p, value[p] === s ? null : s)}
                  >
                    {PART_STATES[s].tr}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
