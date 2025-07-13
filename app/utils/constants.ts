export const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8080";
export const WS_BASE_URL = process.env.WS_URL || "ws://localhost:8000";

export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { min: 15, ideal: 30, max: 60 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const SCREEN_SHARE_CONSTRAINTS = {
  video: {
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: { max: 30 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
};
