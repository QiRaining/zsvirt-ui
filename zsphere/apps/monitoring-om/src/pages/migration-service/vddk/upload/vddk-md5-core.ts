import * as CryptoJS from "crypto-js";

export const VDDK_MD5_CHUNK_SIZE = 2 * 1024 * 1024;

const readAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new Error("Read file failed"));
    reader.readAsArrayBuffer(blob);
  });
};

export async function calculateFileMd5OnMainThread(
  file: Blob,
  chunkSize = VDDK_MD5_CHUNK_SIZE,
): Promise<string> {
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new RangeError("chunkSize must be greater than zero");
  }

  const hasher = CryptoJS.algo.MD5.create();

  for (let offset = 0; offset < file.size; offset += chunkSize) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size));
    const buffer = await readAsArrayBuffer(chunk);
    hasher.update(CryptoJS.lib.WordArray.create(new Uint8Array(buffer)));
  }

  return hasher.finalize().toString(CryptoJS.enc.Hex);
}
