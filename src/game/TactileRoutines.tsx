import { useRef, useState } from "react";
import { CarryGhost } from "./PointerCarry";
import { usePointerCarry } from "./usePointerCarry";

function TeaObject({ kettle, filled }: { kettle?: boolean; filled?: boolean }) {
  return (
    <svg viewBox="0 0 160 130" className="h-28 w-32" aria-hidden="true">
      {kettle ? <>
        <path d="M53 48C53 8 123 7 119 56" fill="none" stroke="#82b8aa" strokeWidth="10" />
        <path d="m44 56-27-13 14 41 28 12Z" fill="#91b7b1" />
        <path d="M47 46Q27 90 47 110Q80 124 116 108Q133 87 113 46Z" fill="#6e9994" stroke="#c0d4cb" strokeWidth="2" />
        <path d="M47 46Q80 29 113 46" fill="#c0d4cb" />
        <path d="M63 58Q48 81 58 103" fill="none" stroke="#b9d4c8" strokeWidth="5" opacity=".5" />
      </> : <>
        <path d="M112 48Q151 40 145 72Q139 91 113 84" fill="none" stroke="#cfdbd5" strokeWidth="9" />
        <path d="M36 44h81l-7 61q-34 20-67 0Z" fill="#c9d6ce" stroke="#edf1e9" strokeWidth="2" />
        <ellipse cx="76" cy="45" rx="40" ry="11" fill={filled ? "#785e49" : "#708884"} />
        <path d="M47 60l4 37" stroke="#f2f1df" strokeWidth="6" opacity=".5" />
      </>}
    </svg>
  );
}

export function TeaMini({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState(false);
  const completed = useRef(false);
  const source = ["kettle", "warm-cup", "empty-cup"][phase];
  const destination = ["cup", "hands", "saucer"][phase];
  const label = ["The kettle", "The warm cup", "The empty cup"][phase];
  const place = (id: string, target: string) => {
    if (id !== source || target !== destination || completed.current) return;
    setSelected(false);
    if (phase === 2) { completed.current = true; onDone(); }
    else setPhase((value) => value + 1);
  };
  const carry = usePointerCarry(place);
  return (
    <div ref={carry.rootRef} data-testid="tea-routine" data-phase={phase}>
      <CarryGhost carried={carry.carried} />
      <p aria-live="polite" className="mb-3 font-serif text-sm text-white/80">
        {["Bring the kettle to the cup.", "Lift the warm cup into your hands.", "The last mouthful. Set it on the saucer."][phase]}
      </p>
      <div className="flex min-h-44 items-center justify-around gap-4 border-b border-white/20 pb-3">
        <button
          type="button"
          data-testid={`tea-source-${source}`}
          aria-label={`Pick up ${label.toLowerCase()}`}
          aria-pressed={selected}
          {...carry.sourceProps(source, label)}
          onClick={() => setSelected((value) => !value)}
          className={`cursor-grab rounded p-2 active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white ${selected ? "ring-2 ring-white/60" : ""}`}
        >
          <TeaObject kettle={phase === 0} filled={phase === 1} />
        </button>
        <button
          type="button"
          data-testid={`tea-target-${destination}`}
          aria-label={`Place ${label.toLowerCase()} ${phase === 0 ? "at the cup" : phase === 1 ? "in your hands" : "on the saucer"}`}
          {...carry.targetProps(destination)}
          onClick={() => { if (selected) place(source, destination); }}
          className="carry-drop flex min-h-36 w-36 flex-col items-center justify-center rounded border border-dashed border-white/30 focus-visible:ring-2 focus-visible:ring-white"
        >
          {phase === 0 ? <TeaObject /> : <svg viewBox="0 0 140 100" className="h-24 w-32" aria-hidden="true">
            {phase === 1 ? <path d="M15 66Q14 42 24 39L42 65 37 38Q40 30 46 38L58 67 55 44Q60 34 65 45L70 70 81 43Q88 38 91 46L88 66 109 44Q119 42 117 53L103 79Q65 103 27 83Z" fill="#bc957f" stroke="#d4bca3" strokeWidth="2" /> : <><ellipse cx="70" cy="66" rx="60" ry="18" fill="#c9d6ce" /><ellipse cx="70" cy="64" rx="38" ry="9" fill="none" stroke="#859e94" strokeWidth="2" /></>}
          </svg>}
          <span className="text-xs text-white/70">{["Cup", "Your hands", "Saucer"][phase]}</span>
        </button>
      </div>
    </div>
  );
}

export function BrushRoutine({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState(25);
  const active = useRef(false);
  const strokes = useRef(0);
  const target = 6;
  const stroke = (side: "L" | "R", dragging = false) => {
    if (strokes.current >= target || side !== (strokes.current % 2 === 0 ? "L" : "R")) return;
    strokes.current += 1;
    setCount(strokes.current);
    if (strokes.current === target && !dragging) onDone();
  };
  return (
    <div>
      <div
        data-testid="brush-surface"
        role="group"
        aria-label="Brush across from left to right"
        onPointerDown={(event) => { if (event.button !== 0) return; active.current = true; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => {
          if (!active.current) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = Math.max(12, Math.min(88, (event.clientX - rect.left) / rect.width * 100));
          setPosition(x);
          if (x < 32) stroke("L", true);
          else if (x > 68) stroke("R", true);
        }}
        onPointerUp={() => { active.current = false; if (strokes.current >= target) onDone(); }}
        onPointerCancel={() => {
          active.current = false;
          if (strokes.current >= target) { strokes.current = target - 1; setCount(target - 1); }
        }}
        className="relative h-40 cursor-grab touch-none overflow-hidden border-b border-white/20 active:cursor-grabbing"
      >
        <svg viewBox="0 0 260 100" className="absolute inset-x-8 bottom-4 h-24 w-[calc(100%-4rem)]" aria-hidden="true">
          <path d="M24 24Q130 74 236 24L224 67Q130 107 36 67Z" fill="#e4e1cf" stroke="#c2b8a3" strokeWidth="3" />
          {[60, 95, 130, 165, 200].map((x) => <path key={x} d={`M${x} 42v34`} stroke="#aba99c" strokeWidth="2" />)}
        </svg>
        <svg viewBox="0 0 180 50" className="pointer-events-none absolute top-12 h-12 w-40 -translate-x-1/2 -rotate-6" style={{ left: `${position}%` }} aria-hidden="true">
          <path d="M14 18h38v24H14Z" fill="#e9efdf" /><path d="M10 9h42q16 0 27 10h90v12H70L49 22H10Z" fill="#77b6ae" />
          <path d="M20 22v17m9-17v17m9-17v17m9-17v17" stroke="#abbab0" strokeWidth="2" />
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" onClick={() => stroke("L")} disabled={count % 2 !== 0} className="min-h-11 rounded px-3 text-sm disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white">Left</button>
        <span role="status" className="text-xs text-white/65">{count}/{target} strokes</span>
        <button type="button" onClick={() => stroke("R")} disabled={count % 2 !== 1} className="min-h-11 rounded px-3 text-sm disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white">Right</button>
      </div>
    </div>
  );
}
