"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import styles from "./Hero.module.css";

type Ripple = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const RIPPLE_COLORS = ["var(--magenta)", "var(--orange)"];
const THROTTLE_MS = 120;

export default function HeroRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const lastSpawn = useRef(0);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    const now = Date.now();
    if (now - lastSpawn.current < THROTTLE_MS) return;
    lastSpawn.current = now;

    const rect = event.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    const color = RIPPLE_COLORS[id % RIPPLE_COLORS.length];

    setRipples((current) => [
      ...current,
      { id, x: event.clientX - rect.left, y: event.clientY - rect.top, color },
    ]);
  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  return (
    <div
      className={styles.rippleLayer}
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y, background: ripple.color }}
          onAnimationEnd={() => removeRipple(ripple.id)}
        />
      ))}
    </div>
  );
}
