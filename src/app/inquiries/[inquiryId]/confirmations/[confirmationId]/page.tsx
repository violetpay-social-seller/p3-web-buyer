import { ConfirmationDetailPage } from "@/features/confirmation/confirmation-detail-page";

export default async function InquiryConfirmationDetailRoute({
  params,
}: {
  params: Promise<{ confirmationId: string; inquiryId: string }>;
}) {
  const { confirmationId, inquiryId } = await params;

  return <ConfirmationDetailPage confirmationId={decodeURIComponent(confirmationId)} inquiryId={decodeURIComponent(inquiryId)} />;
}
