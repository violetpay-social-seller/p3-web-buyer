import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ inquiryId: string }>;
}) {
  const { inquiryId } = await params;

  return <BuyerBlueprintPage context={`inquiryId = ${decodeURIComponent(inquiryId)}`} page={buyerPages.inquiryDetail} />;
}
