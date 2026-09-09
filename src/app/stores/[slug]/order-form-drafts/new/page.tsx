import { OrderDraftFlowPage } from "@/features/order-flow/order-draft-flow-page";

export default async function NewOrderFormDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string; noticeAgreed?: string; pickupDate?: string; pickupTime?: string; resumeSubmit?: string; startAssetId?: string; startSource?: string; startUploadKey?: string; state?: string; step?: string; submissionId?: string }>;
}) {
  const { slug } = await params;
  const { mode, noticeAgreed, pickupDate, pickupTime, resumeSubmit, startAssetId, startSource, startUploadKey, state, step, submissionId } = await searchParams;

  return <OrderDraftFlowPage initialFormState={state} initialMode={mode} initialNoticeAgreed={noticeAgreed} initialPickupDate={pickupDate} initialPickupTime={pickupTime} initialResumeSubmit={resumeSubmit} initialStartAssetId={startAssetId} initialStartSource={startSource} initialStartUploadKey={startUploadKey} initialStep={step} initialSubmissionId={submissionId} slug={decodeURIComponent(slug)} />;
}
