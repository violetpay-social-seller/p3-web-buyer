import { AuthenticatedBuyerPage } from "@/features/api-backed/authenticated-buyer-page";
import { buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { orderId } = await params;
  const { state } = await searchParams;
  const context = [`orderId = ${decodeURIComponent(orderId)}`, state ? `state=${state}` : ""].filter(Boolean).join(", ");

  return <AuthenticatedBuyerPage context={context} orderId={decodeURIComponent(orderId)} page={buyerPages.orderDetail} />;
}
