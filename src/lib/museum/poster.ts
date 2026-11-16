import { fitWithin } from "@/lib/studentWorks/images";

const POSTER_MAX_EDGE = 1600;

function loadVideo(file: File): Promise<{
  video: HTMLVideoElement;
  release: () => void;
}> {
  return new Promise((resolve, reject) => {
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
  });
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    video.onseeked = () => resolve();
    video.onerror = () =>
      reject(new Error("Your browser couldn't read that video."));
    video.currentTime = time;
  });
}

export async function capturePoster(
  videoFile: File,
): Promise<{ blob: Blob; width: number; height: number }> {
  const { video, release } = await loadVideo(videoFile);
  try {
    const at = video.duration >= 1 ? 0.5 : 0;
    if (at > 0) await seek(video, at);
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
    return video.videoHeight > video.videoWidth ? "vertical" : "landscape";
  } finally {
    release();
  }
}
