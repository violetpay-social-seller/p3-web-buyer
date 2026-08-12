import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <BuyerBlueprintPage context={`store slug = ${decodeURIComponent(slug)}`} page={buyerPages.storeDetail} />;
}
