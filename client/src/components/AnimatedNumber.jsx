import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, decimals = 0, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            function tick(now) {
              const progress = Math.min(1, (now - start) / duration);
              setDisplay(value * (1 - Math.pow(1 - progress, 3))); // ease-out cubic
              if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <strong ref={ref}>{display.toFixed(decimals)}</strong>;
}
