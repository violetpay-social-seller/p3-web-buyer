import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ inquiryId: string }>;
  searchParams: Promise<{ state?: string; submitted?: string }>;
}) {
  const { inquiryId } = await params;
  const { state, submitted } = await searchParams;
  const context = [`inquiryId = ${decodeURIComponent(inquiryId)}`, state ? `state=${state}` : "", submitted ? `submitted=${submitted}` : ""].filter(Boolean).join(", ");

  return <BuyerBlueprintPage context={context} page={buyerPages.inquiryDetail} />;
}
