'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;        // мс
  prefix?: string;
  suffix?: string;
  formatter?: (v: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1800,
  prefix = '',
  suffix = '',
  formatter,
  className = '',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to   = value;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = to;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const text = formatter ? formatter(display) : display.toLocaleString('ru-RU');

  return (
    <span className={className}>
      {prefix}{text}{suffix}
    </span>
  );
}
