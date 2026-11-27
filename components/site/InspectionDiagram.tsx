// Yukarıdan görünüşlü araç şeması: parçalar birbirine değmeden yerleşir, ekspertiz durumuna göre renklenir.
// Orijinal dışındaki parçalarda durumun kısaltması yazar (LB, B, D). Ön taraf farlarla, arka taraf stop
// lambalarıyla belli olur. Sitede salt okunur, yönetim panelinde (onPartClick verilirse) tıklanabilir.
import type { Lang } from "@/lib/i18n";
import { BODY_PARTS, PART_STATES, type BodyPart, type Inspection } from "@/lib/vehicle-specs";

const W = 200;

/** Sol taraf parçalarının x koordinatlarını aynalayarak sağ taraf parçasını üretir. */
const mirror = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) => `${W - Number(x)} ${y}`);

const LEFT = {
  "sol-on-camurluk": "M50 36 L50 120 L28 120 Q24 74 32 44 Q37 36 50 36 Z",
  "sol-on-kapi": "M28 124 L52 124 L58 206 L28 206 Q26 165 28 124 Z",
  "sol-arka-kapi": "M28 210 L58 210 L56 290 L28 290 Q26 250 28 210 Z",
  "sol-arka-camurluk": "M28 294 L54 294 L52 374 L36 374 Q26 360 26 330 Q26 310 28 294 Z",
};

const PATHS: Record<BodyPart, string> = {
  "on-tampon": "M46 32 Q42 14 62 9 Q100 3 138 9 Q158 14 154 32 Z",
  kaput: "M56 36 Q100 30 144 36 L147 120 Q100 115 53 120 Z",
  tavan: "M62 166 Q100 161 138 166 L140 266 Q100 271 60 266 Z",
  bagaj: "M58 306 Q100 311 142 306 L146 374 Q100 379 54 374 Z",
  "arka-tampon": "M46 380 L154 380 Q158 400 138 406 Q100 412 62 406 Q42 400 46 380 Z",
  ...LEFT,
  "sag-on-camurluk": mirror(LEFT["sol-on-camurluk"]),
  "sag-on-kapi": mirror(LEFT["sol-on-kapi"]),
  "sag-arka-kapi": mirror(LEFT["sol-arka-kapi"]),
  "sag-arka-camurluk": mirror(LEFT["sol-arka-camurluk"]),
};

/** Kısaltmanın yazılacağı nokta (parçanın ortası). */
const CENTERS: Record<BodyPart, [number, number]> = {
  "on-tampon": [100, 22],
  kaput: [100, 78],
  tavan: [100, 216],
  bagaj: [100, 341],
  "arka-tampon": [100, 393],
  "sol-on-camurluk": [39, 82],
  "sol-on-kapi": [42, 165],
  "sol-arka-kapi": [42, 250],
  "sol-arka-camurluk": [40, 334],
  "sag-on-camurluk": [W - 39, 82],
  "sag-on-kapi": [W - 42, 165],
  "sag-arka-kapi": [W - 42, 250],
  "sag-arka-camurluk": [W - 40, 334],
};

const BODY = "M40 14 Q100 0 160 14 Q178 22 176 70 L176 350 Q178 398 160 406 Q100 418 40 406 Q22 398 24 350 L24 70 Q22 22 40 14 Z";

interface Props {
  inspection: Inspection;
  lang?: Lang;
  notSpecified: string;
  /** Verilirse parçalar tıklanabilir olur (yönetim paneli). */
  onPartClick?: (part: BodyPart) => void;
  className?: string;
}

export function InspectionDiagram({ inspection, lang = "tr", notSpecified, onPartClick, className }: Props) {
  const parts = Object.keys(PATHS) as BodyPart[];
  const labelOf = (p: BodyPart) => {
    const state = inspection[p];
    return `${BODY_PARTS[p][lang]}: ${state ? PART_STATES[state][lang] : notSpecified}`;
  };
  return (
    <svg
      viewBox={`0 0 ${W} 416`}
      className={className ?? "inspection-diagram"}
      role="img"
      aria-label={parts.map(labelOf).join(", ")}
    >
      {/* tekerlekler ve aynalar gövdenin altında kalır */}
      <g fill="#c3c8ce">
        <rect x={16} y={52} width={10} height={50} rx={4} />
        <rect x={16} y={308} width={10} height={50} rx={4} />
        <rect x={W - 26} y={52} width={10} height={50} rx={4} />
        <rect x={W - 26} y={308} width={10} height={50} rx={4} />
        <rect x={12} y={128} width={14} height={9} rx={4} />
        <rect x={W - 26} y={128} width={14} height={9} rx={4} />
      </g>
      <path d={BODY} fill="#f1f3f5" stroke="#d3d8dd" strokeWidth={1.2} />
      {/* camlar */}
      <g fill="#e4eaf0" stroke="#c9d1d9" strokeWidth={1}>
        <path d="M55 124 Q100 118 145 124 L138 162 Q100 157 62 162 Z" />
        <path d="M62 270 Q100 275 138 270 L143 302 Q100 307 57 302 Z" />
      </g>

      {parts.map((p) => {
        const state = inspection[p];
        const interactive = onPartClick
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": labelOf(p),
              onClick: () => onPartClick(p),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPartClick(p);
                }
              },
            }
          : {};
        return (
          <path
            key={p}
            d={PATHS[p]}
            fill={state ? PART_STATES[state].color : "#ffffff"}
            stroke="#a9b0b8"
            strokeWidth={1.1}
            strokeLinejoin="round"
            className={onPartClick ? "diagram-part clickable" : "diagram-part"}
            {...interactive}
          >
            <title>{labelOf(p)}</title>
          </path>
        );
      })}

      {/* farlar (ön) ve stop lambaları (arka) */}
      <g>
        <rect x={54} y={14} width={20} height={7} rx={3.5} fill="#fdf6dc" stroke="#d8bd6a" strokeWidth={1} />
        <rect x={W - 74} y={14} width={20} height={7} rx={3.5} fill="#fdf6dc" stroke="#d8bd6a" strokeWidth={1} />
        <rect x={54} y={396} width={18} height={6} rx={3} fill="#efa3a0" stroke="#c8312c" strokeWidth={1} />
        <rect x={W - 72} y={396} width={18} height={6} rx={3} fill="#efa3a0" stroke="#c8312c" strokeWidth={1} />
      </g>

      {/* kısaltmalar: LB, B, D */}
      <g className="diagram-letters" aria-hidden="true">
        {parts.map((p) => {
          const state = inspection[p];
          const abbr = state ? PART_STATES[state].abbr[lang] : "";
          if (!abbr) return null;
          const [x, y] = CENTERS[p];
          return (
            <text key={p} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={PART_STATES[state!].ink}>
              {abbr}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
