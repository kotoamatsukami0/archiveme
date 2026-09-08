/**
 * Generate a lightweight video thumbnail snapshot directly on the client using HTML5 Canvas.
 * Returns a JPEG Blob, or null if unsupported/failed.
 */
export function generateVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    // Only process video files
    if (!file.type.startsWith("video/")) {
      return resolve(null);
    }

    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(file);

    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "metadata";

    let hasResolved = false;

    const cleanup = () => {
      URL.revokeObjectURL(videoUrl);
      video.remove();
    };

    const done = (blob: Blob | null) => {
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        resolve(blob);
      }
    };

    video.onloadedmetadata = () => {
      // Seek to 1 second or midway if video is very short
      const targetTime = video.duration > 2 ? 1.0 : Math.max(0.1, video.duration / 2);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDimension = 540;
        let width = video.videoWidth || 480;
        let height = video.videoHeight || 360;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          canvas.toBlob(
            (blob) => done(blob),
            "image/jpeg",
            0.82
          );
          return;
        }
      } catch (err) {
        console.warn("Error capturing canvas video frame:", err);
      }
      done(null);
    };

    video.onerror = () => {
      done(null);
    };

    // 4-second timeout guard
    setTimeout(() => {
      done(null);
    }, 4000);
  });
}
