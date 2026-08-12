import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <BuyerBlueprintPage context={`orderId = ${decodeURIComponent(orderId)}`} page={buyerPages.orderDetail} />;
}
