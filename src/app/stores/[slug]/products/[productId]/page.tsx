import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";
import { getStore, getStoreGalleryItem } from "@/shared/api/buyer-api";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string; slug: string }>;
  searchParams: Promise<{ startAssetId?: string; startSource?: string }>;
}) {
  const { productId, slug } = await params;
  const { startAssetId, startSource } = await searchParams;
  const decodedSlug = decodeURIComponent(slug);
  const decodedProductId = decodeURIComponent(productId);
  const [store, selectedGalleryItem] = await Promise.all([
    getStore(decodedSlug),
    getStoreGalleryItem(decodedSlug, decodedProductId).catch(() => undefined),
  ]);
  const context = [
    `store slug = ${decodedSlug}`,
    `productId = ${decodedProductId}`,
    startAssetId ? `startAssetId=${encodeURIComponent(startAssetId)}` : "",
    startSource ? `startSource=${startSource}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <BuyerBlueprintPage
      apiData={{ selectedGalleryItem, store }}
      context={context}
      page={buyerPages.productDetail}
    />
  );
}
