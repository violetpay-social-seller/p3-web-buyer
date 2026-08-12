import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string; slug: string }>;
}) {
  const { productId, slug } = await params;

  return (
    <BuyerBlueprintPage
      context={`store slug = ${decodeURIComponent(slug)}, productId = ${decodeURIComponent(productId)}`}
      page={buyerPages.productDetail}
    />
  );
}
