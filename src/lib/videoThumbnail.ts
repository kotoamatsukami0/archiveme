/**
 * Generate a lightweight video thumbnail snapshot directly on the client using HTML5 Canvas.
 * Returns a high-efficiency JPEG Blob (~15-25KB), or null if unsupported/failed.
 */
export function generateVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
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
      const targetTime = video.duration > 2 ? 1.0 : Math.max(0.1, video.duration / 2);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDimension = 380;
        let width = video.videoWidth || 380;
        let height = video.videoHeight || 280;

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
            0.72
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

    setTimeout(() => {
      done(null);
    }, 3500);
  });
}

/**
 * Generate a compressed, lightweight image thumbnail (~15-30KB) directly on the client.
 * Allows instant loading on mobile even over slow cellular connections.
 */
export function generateImageThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type.includes("svg")) {
      return resolve(null);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    let hasResolved = false;

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    const done = (blob: Blob | null) => {
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        resolve(blob);
      }
    };

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDimension = 380;
        let width = img.naturalWidth || 380;
        let height = img.naturalHeight || 380;

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
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => done(blob),
            "image/jpeg",
            0.72
          );
          return;
        }
      } catch (e) {
        console.warn("Failed to generate image thumbnail", e);
      }
      done(null);
    };

    img.onerror = () => {
      done(null);
    };

    setTimeout(() => {
      done(null);
    }, 3000);
  });
}
