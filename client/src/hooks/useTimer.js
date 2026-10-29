import { useEffect, useRef, useState } from 'react';

// Countdown timer in seconds. Calls onExpire exactly once.
export default function useTimer(initialSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  const format = () => {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  return { secondsLeft, formatted: format() };
}
