import { AuthenticatedBuyerPage } from "@/features/api-backed/authenticated-buyer-page";
import { buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ inquiryId: string }>;
  searchParams: Promise<{ state?: string; submissionId?: string; submitted?: string }>;
}) {
  const { inquiryId } = await params;
  const { state, submissionId, submitted } = await searchParams;
  const context = [
    `inquiryId = ${decodeURIComponent(inquiryId)}`,
    state ? `state=${state}` : "",
    submitted ? `submitted=${submitted}` : "",
    submissionId ? `submissionId=${submissionId}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return <AuthenticatedBuyerPage context={context} inquiryId={decodeURIComponent(inquiryId)} page={buyerPages.inquiryDetail} />;
}
