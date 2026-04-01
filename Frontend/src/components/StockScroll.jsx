import { useEffect, useRef } from "react";

export default function AutoScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const interval = setInterval(() => {
      el.scrollTop += 1;
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      style={{ height: 150, overflowY: "hidden" }}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <p key={i}>News {i}</p>
      ))}
    </div>
  );
}