import { createPortal } from "react-dom";
import type { Carry } from "./usePointerCarry";

export function CarryGhost({ carried }: { carried: Carry | null }) {
  if (!carried) return null;
  return createPortal(
    <div data-testid="carry-ghost" aria-hidden="true" className="pointer-events-none fixed z-[100] max-w-64 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] rounded border border-white/50 bg-[color:var(--color-paper)] px-4 py-3 font-serif text-sm text-[color:var(--color-ink)] shadow-xl" style={{ left: carried.x, top: carried.y }}>
      {carried.label}
    </div>, document.body,
  );
}
