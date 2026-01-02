import './style.css'
import { FaceMesh } from "@mediapipe/face_mesh";
import { drawLandmarks } from "@mediapipe/drawing_utils";

const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const showLandmarks = document.getElementById("showLandmarks") as HTMLInputElement
showLandmarks.checked = false

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults((results) => {
  if (!ctx || !canvas) return;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    results.image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      //drawConnectors(ctx, landmarks, FaceMesh.FACEMESH_TESSELATION, { color: "#C0C0C0", lineWidth: 1 });
      drawLandmarks(ctx, landmarks, { color: "#00ff2aff", lineWidth: 0.1 });
    }
  }
  ctx.restore();
});

  // Initialize webcam
async function startCamera() {
  const constraints: MediaStreamConstraints = {
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  // Wait until video is ready
  await new Promise((resolve) => {
    video.onloadeddata = () => resolve(null);
  });
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;

  canvas.width = w;
  canvas.height = h;

  canvas.style.width = '640px';
  canvas.style.height = '480px';
  canvas.style.display = 'block';

  // Process video frames continuously
  async function processVideo() {
    if (!ctx || !canvas) return;
    if(showLandmarks && showLandmarks.checked){
      try {
        await faceMesh.send({ image: video });
      } catch (e) {
        console.error("faceMesh.send error:", e);
      }
    } else {
      // Landmarks disabled: just draw the raw video frame to the canvas
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(processVideo);
  }
  processVideo();
}

// Start everything
startCamera().catch((err) => console.error("Error starting camera:", err));
