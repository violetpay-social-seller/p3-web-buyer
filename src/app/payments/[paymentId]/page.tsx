import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;

  return <BuyerBlueprintPage context={`paymentId = ${decodeURIComponent(paymentId)}`} page={buyerPages.paymentDetail} />;
}
