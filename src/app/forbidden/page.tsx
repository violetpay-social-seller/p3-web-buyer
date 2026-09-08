import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return <BuyerBlueprintPage context={reason ? `reason=${reason}` : undefined} page={buyerPages.forbidden} />;
}
