import { OrderDraftFlowPage } from "@/features/order-flow/order-draft-flow-page";

export default async function NewOrderFormDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pickupDate?: string; pickupTime?: string; resumeSubmit?: string; startAssetId?: string; startSource?: string; startUploadKey?: string; state?: string; step?: string }>;
}) {
  const { slug } = await params;
  const { pickupDate, pickupTime, resumeSubmit, startAssetId, startSource, startUploadKey, state, step } = await searchParams;

  return <OrderDraftFlowPage initialFormState={state} initialPickupDate={pickupDate} initialPickupTime={pickupTime} initialResumeSubmit={resumeSubmit} initialStartAssetId={startAssetId} initialStartSource={startSource} initialStartUploadKey={startUploadKey} initialStep={step} slug={decodeURIComponent(slug)} />;
}
