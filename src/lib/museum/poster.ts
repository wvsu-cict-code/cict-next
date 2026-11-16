import { fitWithin } from "@/lib/studentWorks/images";

const POSTER_MAX_EDGE = 1600;
const VIDEO_TIMEOUT_MS = 10_000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function loadVideo(file: File): Promise<{
  video: HTMLVideoElement;
  release: () => void;
}> {
  return withTimeout(
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      const release = () => {
        video.removeAttribute("src");
        video.load();
        URL.revokeObjectURL(url);
      };
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = () => resolve({ video, release });
      video.onerror = () => {
        release();
        reject(new Error("Your browser couldn't read that video."));
      };
      video.src = url;
    }),
    VIDEO_TIMEOUT_MS,
    "That video took too long to load. Try a shorter clip.",
  );
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return withTimeout(
    new Promise((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () =>
        reject(new Error("Your browser couldn't read that video."));
      video.currentTime = time;
    }),
    VIDEO_TIMEOUT_MS,
    "That video took too long to load. Try a shorter clip.",
  );
}

function requireDimensions(video: HTMLVideoElement) {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("Your browser couldn't read that video's dimensions.");
  }
}

export async function capturePoster(
  videoFile: File,
): Promise<{ blob: Blob; width: number; height: number }> {
  const { video, release } = await loadVideo(videoFile);
  try {
    requireDimensions(video);
    const at = video.duration >= 1 ? 0.5 : 0;
    if (at > 0) await seek(video, at);
    requireDimensions(video);
    const size = fitWithin(
      { width: video.videoWidth, height: video.videoHeight },
      POSTER_MAX_EDGE,
    );
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser couldn't process that video.");
    context.drawImage(video, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
    if (!blob) throw new Error("Your browser couldn't process that video.");
    return { blob, width: size.width, height: size.height };
  } finally {
    release();
  }
}

export async function readVideoOrientation(
  file: File,
): Promise<"landscape" | "vertical"> {
  const { video, release } = await loadVideo(file);
  try {
    requireDimensions(video);
    return video.videoHeight > video.videoWidth ? "vertical" : "landscape";
  } finally {
    release();
  }
}
