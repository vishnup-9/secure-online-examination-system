import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { detectFaces } from '../lib/faceDetection';

// Central proctoring hook. Wires up all browser-observable anti-cheating
// signals for a single exam attempt and reports them to the backend.
// The backend is the source of truth for risk scoring — this hook only
// detects and forwards events.
export default function useProctoring({ attemptId, security, onCritical, onFlagged }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState('unknown'); // unknown | ok | no_face | multiple_faces
  const [violationCount, setViolationCount] = useState(0);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [warnings, setWarnings] = useState([]); // recent toast-style warnings

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const noFaceSinceRef = useRef(null);
  const lookAwaySinceRef = useRef(null);
  const detectIntervalRef = useRef(null);

  const graceMs = (security?.faceCheckGraceSeconds ?? 8) * 1000;
  const lookAwayMs = (security?.lookAwaySustainSeconds ?? 5) * 1000;

  const report = useCallback(async (eventType, metadata = {}) => {
    if (!attemptId) return;
    try {
      const res = await api.post('/violations', { attemptId, eventType, metadata });
      setViolationCount(res.data.violationCount);
      setRiskLevel(res.data.riskLevel);
      setWarnings((w) => [{ id: Date.now(), eventType, severity: res.data.event.severity }, ...w].slice(0, 5));
      if (res.data.autoSubmitted) onFlagged?.();
      else if (res.data.riskLevel === 'CRITICAL') onCritical?.();
    } catch (err) {
      // Swallow network errors here — we don't want a proctoring log
      // failure to disrupt the exam UI. It will be retried on next event.
    }
  }, [attemptId, onCritical, onFlagged]);

  // --- Tab / window / clipboard / keyboard signals ---
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) report('VISIBILITY_CHANGE');
    };
    const onBlur = () => report('WINDOW_BLUR');
    const onCopy = (e) => { report('COPY'); };
    const onCut = (e) => { report('CUT'); };
    const onPaste = (e) => { report('PASTE'); };
    const onContextMenu = (e) => { e.preventDefault(); report('RIGHT_CLICK'); };
    const onKeyDown = (e) => {
      const blockedCombo =
        (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u', 'p', 's'].includes(e.key.toLowerCase());
      const devTools = e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key));
      if (devTools || blockedCombo) {
        e.preventDefault();
        report('SUSPICIOUS_SHORTCUT', { key: e.key });
      }
    };
    const onBeforeUnload = (e) => {
      report('REFRESH_ATTEMPT');
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('paste', onPaste);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [report]);

  // --- Fullscreen exit ---
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) report('FULLSCREEN_EXIT');
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [report]);

  // --- Webcam + local face detection ---
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setCameraActive(false);
        report('WEBCAM_DISCONNECT');
      });

      detectIntervalRef.current = setInterval(async () => {
        const { faceCount, approxYawDegrees, ok } = await detectFaces(videoRef.current);
        if (!ok) return;

        if (faceCount === 0) {
          setFaceStatus('no_face');
          if (!noFaceSinceRef.current) noFaceSinceRef.current = Date.now();
          else if (Date.now() - noFaceSinceRef.current > graceMs) {
            report('NO_FACE');
            noFaceSinceRef.current = Date.now(); // reset grace window after reporting
          }
        } else {
          noFaceSinceRef.current = null;
          if (faceCount > 1) {
            setFaceStatus('multiple_faces');
            report('MULTIPLE_FACES', { faceCount });
          } else {
            setFaceStatus('ok');
            if (approxYawDegrees !== null && Math.abs(approxYawDegrees) > 35) {
              if (!lookAwaySinceRef.current) lookAwaySinceRef.current = Date.now();
              else if (Date.now() - lookAwaySinceRef.current > lookAwayMs) {
                report('LOOKING_AWAY', { approxYawDegrees });
                lookAwaySinceRef.current = Date.now();
              }
            } else {
              lookAwaySinceRef.current = null;
            }
          }
        }
      }, 2000);
    } catch (err) {
      setCameraActive(false);
      report('WEBCAM_DISCONNECT', { reason: 'permission_denied_or_unavailable' });
    }
  }, [graceMs, lookAwayMs, report]);

  const stopCamera = useCallback(() => {
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Periodic heartbeat so the admin monitoring page has fresh status.
  useEffect(() => {
    if (!attemptId) return undefined;
    const interval = setInterval(() => {
      api.post(`/attempts/${attemptId}/heartbeat`, {
        camera: { active: cameraActive, faceDetected: faceStatus === 'ok' }
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [attemptId, cameraActive, faceStatus]);

  return { videoRef, cameraActive, faceStatus, violationCount, riskLevel, warnings, startCamera, stopCamera, report };
}
