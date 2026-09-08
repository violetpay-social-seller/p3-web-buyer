import { OrderFormSubmissionDetailPage } from "@/features/order-flow/order-form-submission-detail-page";

export default async function InquiryOrderFormSubmissionPage({
  params,
}: {
  params: Promise<{ inquiryId: string; submissionId: string }>;
}) {
  const { inquiryId, submissionId } = await params;

  return (
    <OrderFormSubmissionDetailPage
      inquiryId={decodeURIComponent(inquiryId)}
      submissionId={decodeURIComponent(submissionId)}
    />
  );
}
