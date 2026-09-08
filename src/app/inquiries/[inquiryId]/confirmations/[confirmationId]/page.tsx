import { ConfirmationDetailPage } from "@/features/confirmation/confirmation-detail-page";

export default async function InquiryConfirmationDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ confirmationId: string; inquiryId: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { confirmationId, inquiryId } = await params;
  const { state } = await searchParams;

  return <ConfirmationDetailPage confirmationId={decodeURIComponent(confirmationId)} inquiryId={decodeURIComponent(inquiryId)} state={state} />;
}
