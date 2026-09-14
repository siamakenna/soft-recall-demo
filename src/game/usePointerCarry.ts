import { useRef, useState, type PointerEvent } from "react";

export type Carry = { id: string; label: string; x: number; y: number };

export function usePointerCarry(onDrop: (id: string, target: string) => void) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [carried, setCarried] = useState<Carry | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const targetAt = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop-target]");
    return element && rootRef.current?.contains(element) ? element.dataset.dropTarget ?? null : null;
  };
  const cancel = () => { gesture.current = null; setCarried(null); setOver(null); };

  const sourceProps = (id: string, label: string) => ({
    draggable: false,
    onDragStart: (event: React.DragEvent) => event.preventDefault(),
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || !event.isPrimary) return;
      suppressClick.current = false;
      gesture.current = { id, x: event.clientX, y: event.clientY, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const active = gesture.current;
      if (!active || active.id !== id) return;
      if (!active.moved && Math.hypot(event.clientX - active.x, event.clientY - active.y) < 5) return;
      active.moved = true;
      event.preventDefault();
      setCarried({ id, label, x: event.clientX, y: event.clientY });
      setOver(targetAt(event.clientX, event.clientY));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const moved = gesture.current?.moved;
      const target = moved ? targetAt(event.clientX, event.clientY) : null;
      suppressClick.current = Boolean(moved);
      cancel();
      if (target) onDrop(id, target);
    },
    onPointerCancel: () => { suppressClick.current = true; cancel(); },
    onLostPointerCapture: cancel,
    onClickCapture: (event: React.MouseEvent) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    style: { touchAction: "none" as const },
  });
  const targetProps = (id: string) => ({ "data-drop-target": id, "data-drop-active": over === id });
  return { rootRef, carried, sourceProps, targetProps };
}
