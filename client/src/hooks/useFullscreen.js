import { useCallback, useEffect, useState } from 'react';

export default function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      // Some browsers require a user gesture; caller should trigger this
      // from a click handler.
    }
  }, []);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (err) { /* ignore */ }
    }
  }, []);

  return { isFullscreen, enter, exit };
}
