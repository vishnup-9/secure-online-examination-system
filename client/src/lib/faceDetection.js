// Thin wrapper around @mediapipe/tasks-vision FaceDetector.
// Runs fully in the browser — no video frame ever leaves the device.
// Falls back gracefully (reports "unknown") if the model cannot be loaded,
// e.g. on very old browsers or when offline.

let FaceDetectorClass = null;
let FilesetResolverClass = null;
let detectorInstance = null;
let loadFailed = false;

async function loadMediapipe() {
  if (detectorInstance || loadFailed) return detectorInstance;
  try {
    const vision = await import('@mediapipe/tasks-vision');
    FaceDetectorClass = vision.FaceDetector;
    FilesetResolverClass = vision.FilesetResolver;
    const filesetResolver = await FilesetResolverClass.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    detectorInstance = await FaceDetectorClass.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'CPU'
      },
      runningMode: 'VIDEO'
    });
    return detectorInstance;
  } catch (err) {
    console.warn('Face detection model failed to load; monitoring will report "unknown".', err);
    loadFailed = true;
    return null;
  }
}

// Runs one detection pass on a <video> element.
// Returns { faceCount, approxYawDegrees, ok } — never the raw frame.
export async function detectFaces(videoEl) {
  const detector = await loadMediapipe();
  if (!detector || !videoEl || videoEl.readyState < 2) {
    return { faceCount: null, approxYawDegrees: null, ok: false };
  }
  try {
    const result = detector.detectForVideo(videoEl, performance.now());
    const detections = result?.detections || [];
    let approxYawDegrees = null;

    if (detections.length === 1) {
      // Rough head-orientation proxy using the eye keypoints' horizontal
      // offset relative to the face bounding box centre. This is NOT
      // identity/recognition — only a coarse left/right orientation signal.
      const kp = detections[0].keypoints;
      const box = detections[0].boundingBox;
      if (kp && kp.length >= 2 && box) {
        const eyeMidX = (kp[0].x + kp[1].x) / 2;
        const boxCenterX = box.originX + box.width / 2;
        const normalizedOffset = (eyeMidX - boxCenterX) / (box.width || 1);
        approxYawDegrees = Math.round(normalizedOffset * 90);
      }
    }

    return { faceCount: detections.length, approxYawDegrees, ok: true };
  } catch (err) {
    return { faceCount: null, approxYawDegrees: null, ok: false };
  }
}

export function isFaceDetectionAvailable() {
  return !loadFailed;
}
