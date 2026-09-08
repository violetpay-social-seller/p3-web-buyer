import type { OrderFormSubmissionResponse, OrderFormSubmissionReferenceAsset } from "@/shared/api/buyer-api";
import type { ReferenceAssetPreview } from "@/features/order-flow/reference-asset-preview-grid";

export function getOrderFormSubmissionReferenceAssets(submission?: OrderFormSubmissionResponse | null): ReferenceAssetPreview[] {
  return normalizeReferenceAssets(parseReferenceAssets(submission?.referenceAssets));
}

function parseReferenceAssets(source: OrderFormSubmissionResponse["referenceAssets"] | undefined): unknown[] {
  if (!source) return [];
  if (Array.isArray(source)) return source;

  const trimmed = source.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return parsed;
    if (isRecord(parsed) && Array.isArray(parsed.referenceAssets)) return parsed.referenceAssets;
  } catch {
    return [];
  }

  return [];
}

function normalizeReferenceAssets(source: unknown[]) {
  return source.flatMap((item, index): ReferenceAssetPreview[] => {
    if (typeof item === "string") {
      return item ? [{ assetId: item, sortOrder: index }] : [];
    }

    if (!isRecord(item)) return [];

    const asset = item as OrderFormSubmissionReferenceAsset;
    const assetId = typeof asset.assetId === "string" ? asset.assetId : null;
    const deliveryUrl = typeof asset.deliveryUrl === "string" ? asset.deliveryUrl : null;
    if (!assetId && !deliveryUrl) return [];

    return [
      {
        assetId,
        deliveryUrl,
        sortOrder: typeof asset.sortOrder === "number" ? asset.sortOrder : index,
        source: typeof asset.source === "string" ? asset.source : null,
      },
    ];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
