import React from 'react';
import { Camera, CameraOff, ShieldCheck, UserX, Users } from 'lucide-react';

const statusMap = {
  ok: { label: 'Face: Detected', color: 'text-green-600', icon: ShieldCheck },
  no_face: { label: 'Face: Not Detected', color: 'text-red-600', icon: UserX },
  multiple_faces: { label: 'Multiple Faces!', color: 'text-red-600', icon: Users },
  unknown: { label: 'Face: Checking...', color: 'text-ink-400', icon: ShieldCheck }
};

export default function WebcamMonitor({ videoRef, cameraActive, faceStatus }) {
  const face = statusMap[faceStatus] || statusMap.unknown;
  const FaceIcon = face.icon;

  return (
    <div className="card p-3 w-48">
      <div className="relative rounded-xl overflow-hidden bg-ink-900 aspect-video">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60">
            <CameraOff size={24} />
          </div>
        )}
      </div>
      <div className="mt-2 space-y-1 text-xs font-medium">
        <div className={`flex items-center gap-1.5 ${cameraActive ? 'text-green-600' : 'text-red-600'}`}>
          <Camera size={13} /> Camera: {cameraActive ? 'Active' : 'Inactive'}
        </div>
        <div className="flex items-center gap-1.5 text-brand-600">
          <ShieldCheck size={13} /> AI Monitoring: Active
        </div>
        <div className={`flex items-center gap-1.5 ${face.color}`}>
          <FaceIcon size={13} /> {face.label}
        </div>
      </div>
    </div>
  );
}
