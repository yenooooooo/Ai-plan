/**
 * 영수증 이미지 리사이즈 유틸
 * 업로드 전 클라이언트에서 최대 1920px로 리사이즈
 */

const MAX_SIZE = 1920;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];

export interface ImageValidation {
  valid: boolean;
  error?: string;
}

/** 파일 유효성 검사 */
export function validateImage(file: File): ImageValidation {
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
    return { valid: false, error: "JPG, PNG, HEIC 파일만 가능합니다" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "파일 크기는 10MB 이하여야 합니다" };
  }
  return { valid: true };
}

/** 이미지 리사이즈 (최대 1920px, JPEG 변환) */
export function resizeImage(file: File, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // 리사이즈 필요 여부
      if (width <= MAX_SIZE && height <= MAX_SIZE) {
        // 원본이 작으면 JPEG 변환만
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("변환 실패"))),
          "image/jpeg",
          quality
        );
        return;
      }

      // 비율 유지하며 축소
      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("리사이즈 실패"))),
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드 실패"));
    };

    img.src = url;
  });
}

/** Blob → File 변환 */
export function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type });
}
