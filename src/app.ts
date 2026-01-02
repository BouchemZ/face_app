import './style.css'
import { FaceMesh } from "@mediapipe/face_mesh";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

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
      drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });
    }
  }
  ctx.restore();
});

const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");


navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    if (!video) {
      console.error("No #video element found");
      return;
    }

    video.srcObject = stream;
    // mute so autoplay is less likely to be blocked, then try to play
    video.muted = true;
    video.play().catch(() => {});

    const startDrawing = () => {
      if (!canvas || !ctx) return;
      canvas.width = video.videoWidth || canvas.width;
      canvas.height = video.videoHeight || canvas.height;

      const draw = () => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    };

    video.onloadedmetadata = startDrawing;
    if (video.readyState >= 1) startDrawing(); // in case metadata is already available
  })
  .catch((error) => {
    console.error("Error accessing webcam:", error);
  });