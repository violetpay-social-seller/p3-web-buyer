import {
  getAsset,
  getAssetVariants,
  type AssetVariantResponse,
  type OrderFormSubmissionResponse,
} from "@/shared/api/buyer-api";
import { getOrderFormSubmissionReferenceAssets } from "@/features/order-flow/submission-reference-assets";

export async function hydrateOrderFormSubmissionReferenceAssetUrls(
  submission: OrderFormSubmissionResponse,
): Promise<OrderFormSubmissionResponse> {
  const referenceAssets = getOrderFormSubmissionReferenceAssets(submission);
  const missingAssetIds = [
    ...new Set(
      referenceAssets
        .filter((asset) => asset.assetId && !asset.deliveryUrl)
        .map((asset) => asset.assetId as string),
    ),
  ];

  if (!missingAssetIds.length) return submission;

  const deliveryUrlByAssetId = await resolveAssetDeliveryUrls(missingAssetIds);
  if (!deliveryUrlByAssetId.size) return submission;

  let changed = false;
  const hydratedReferenceAssets = referenceAssets.map((asset) => {
    if (!asset.assetId || asset.deliveryUrl) return asset;

    const deliveryUrl = deliveryUrlByAssetId.get(asset.assetId) ?? null;
    if (!deliveryUrl) return asset;

    changed = true;
    return {
      ...asset,
      deliveryUrl,
    };
  });

  return changed
    ? {
        ...submission,
        referenceAssets: hydratedReferenceAssets,
      }
    : submission;
}

async function resolveAssetDeliveryUrls(assetIds: string[]) {
  const entries = await Promise.all(
    assetIds.map(async (assetId) => {
      const deliveryUrl = await resolveAssetDeliveryUrl(assetId);
      return deliveryUrl ? ([assetId, deliveryUrl] as const) : null;
    }),
  );

  return new Map(entries.filter((entry): entry is readonly [string, string] => Boolean(entry)));
}

async function resolveAssetDeliveryUrl(assetId: string) {
  try {
    const variant = pickPreferredAssetVariant((await getAssetVariants(assetId)).variants);
    if (variant?.deliveryUrl) return variant.deliveryUrl;
  } catch {
    // Fall through to the asset detail endpoint. Some environments expose the original delivery URL first.
  }

  try {
    const asset = await getAsset(assetId);
    return typeof asset.deliveryUrl === "string" && asset.deliveryUrl ? asset.deliveryUrl : null;
  } catch {
    return null;
  }
}

function pickPreferredAssetVariant(variants: AssetVariantResponse["variants"]) {
  return (
    variants.find((variant) => variant.type === "MEDIUM" && variant.deliveryUrl) ??
    variants.find((variant) => variant.type === "LARGE" && variant.deliveryUrl) ??
    variants.find((variant) => variant.type === "THUMBNAIL" && variant.deliveryUrl) ??
    variants.find((variant) => variant.deliveryUrl)
  );
}
