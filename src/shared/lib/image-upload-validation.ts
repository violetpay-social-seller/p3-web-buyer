const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export function validateImageUploadFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "JPG, PNG, WEBP 이미지만 업로드할 수 있어요.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "이미지는 8MB 이하만 업로드할 수 있어요.";
  }

  return "";
}
