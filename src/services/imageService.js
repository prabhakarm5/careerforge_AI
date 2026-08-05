import axiosInstance from "../utils/axiosInstance";
import { API } from "../config/api";
import { dedupeRead } from "../utils/requestDedupe";

const IMAGE_REQUEST_TIMEOUT_MS = 180_000;

function requireImageId(imageId) {
  if (!imageId || imageId === "undefined") throw new Error("Image id is missing. Refresh history and try again.");
  return imageId;
}
function unwrapPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.images)) return payload.images;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function normalizeImageRecord(raw = {}) {
  const imageUrl = raw.storageUrl || raw.imageUrl || raw.url || raw.downloadUrl || "";
  return {
    ...raw,
    id: raw.id || raw.imageId || raw.providerImageId || null,
    imageUrl,
    storageUrl: raw.storageUrl || imageUrl,
    status: raw.status || (imageUrl ? "COMPLETED" : "PROCESSING"),
    favorite: Boolean(raw.favorite),
  };
}


export async function generateImage(prompt, image, model) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  if (model) formData.append("model", model);
  if (image) formData.append("image", image);
  const response = await axiosInstance.post(API.IMAGES.GENERATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: IMAGE_REQUEST_TIMEOUT_MS,
  });
  return normalizeImageRecord(response.data);
}

export async function getImageModels() {
  return dedupeRead("images:models", async () => {
    const response = await axiosInstance.get(API.IMAGES.MODELS);
    return response.data || [];
  }, 300_000);
}

export async function getImageHistory() {
  const response = await axiosInstance.get(API.IMAGES.HISTORY, {
    params: { _ts: Date.now() },
    headers: { "Cache-Control": "no-cache" },
  });
  return unwrapPayload(response.data).map(normalizeImageRecord);
}

export async function deleteImage(imageId) {
  await axiosInstance.delete(API.IMAGES.DELETE(requireImageId(imageId)));
}

export async function toggleFavorite(imageId) {
  const response = await axiosInstance.patch(API.IMAGES.FAVORITE(requireImageId(imageId)), {});
  return normalizeImageRecord(response.data);
}

export async function downloadImage(imageId) {
  const response = await axiosInstance.get(API.IMAGES.DOWNLOAD(requireImageId(imageId)), {
    responseType: "blob",
    timeout: 60_000,
  });
  const disposition = response.headers?.["content-disposition"] || "";
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  return {
    blob: response.data,
    fileName: encodedName ? decodeURIComponent(encodedName) : plainName || `careerforge-image-${imageId}.png`,
  };
}

export async function regenerateImage(imageId) {
  const response = await axiosInstance.post(API.IMAGES.REGENERATE(requireImageId(imageId)), {}, {
    timeout: IMAGE_REQUEST_TIMEOUT_MS,
  });
  return normalizeImageRecord(response.data);
}