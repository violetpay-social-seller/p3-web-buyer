const DB_NAME = "p3-buyer-pending-uploads";
const DB_VERSION = 1;
const STORE_NAME = "uploads";
const LEGACY_SESSION_PREFIX = "p3.buyer.pending-upload.";

export type PendingUploadRecord = {
  file: File;
  lastModified?: number;
  name: string;
  type: string;
};

export type PendingUploadReference = {
  name: string;
  uploadKey: string;
};

export async function persistPendingUpload(file: File, keyPrefix = "order-option"): Promise<PendingUploadReference> {
  if (typeof window === "undefined") {
    throw new Error("브라우저에서 다시 시도해 주세요.");
  }

  const uploadKey = `${keyPrefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  await putPendingUpload(uploadKey, {
    file,
    lastModified: file.lastModified,
    name: file.name,
    type: file.type,
  });

  return { name: file.name, uploadKey };
}

export async function readPendingUpload(uploadKey?: string): Promise<PendingUploadRecord | null> {
  if (!uploadKey || typeof window === "undefined") return null;

  const indexedRecord = await getPendingUpload(uploadKey);
  if (indexedRecord) return indexedRecord;

  return readLegacySessionUpload(uploadKey);
}

export async function clearPendingUpload(uploadKey: string) {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(`${LEGACY_SESSION_PREFIX}${uploadKey}`);

  try {
    const db = await openPendingUploadDb();
    await transactionRequest(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(uploadKey));
    db.close();
  } catch {
    // Clearing pending data should not block the user after a successful submit.
  }
}

async function putPendingUpload(uploadKey: string, record: PendingUploadRecord) {
  const db = await openPendingUploadDb();
  await transactionRequest(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ ...record, uploadKey }));
  db.close();
}

async function getPendingUpload(uploadKey: string): Promise<PendingUploadRecord | null> {
  try {
    const db = await openPendingUploadDb();
    const raw = await transactionRequest<PendingUploadRecord & { uploadKey: string }>(
      db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(uploadKey),
    );
    db.close();

    if (!raw?.file || !raw.name || !raw.type) return null;

    return {
      file: raw.file,
      lastModified: raw.lastModified,
      name: raw.name,
      type: raw.type,
    };
  } catch {
    return null;
  }
}

function openPendingUploadDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "uploadKey" });
      }
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error ?? new Error("이미지를 임시 저장하지 못했어요.")));
  });
}

function transactionRequest<T = unknown>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error ?? new Error("이미지를 임시 저장하지 못했어요.")));
  });
}

function readLegacySessionUpload(uploadKey: string): PendingUploadRecord | null {
  try {
    const raw = window.sessionStorage.getItem(`${LEGACY_SESSION_PREFIX}${uploadKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<{ dataUrl: string; lastModified: number; name: string; type: string }>;
    if (!parsed.dataUrl || !parsed.name || !parsed.type) return null;

    return {
      file: dataUrlToFile({
        dataUrl: parsed.dataUrl,
        lastModified: parsed.lastModified,
        name: parsed.name,
        type: parsed.type,
      }),
      lastModified: parsed.lastModified,
      name: parsed.name,
      type: parsed.type,
    };
  } catch {
    return null;
  }
}

function dataUrlToFile(record: { dataUrl: string; lastModified?: number; name: string; type: string }) {
  const [header, data = ""] = record.dataUrl.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? record.type;
  const binary = window.atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], record.name, {
    lastModified: record.lastModified,
    type: mimeType,
  });
}
