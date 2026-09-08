import { OrderFormDraftConsumePanel } from "@/features/order-flow/order-form-draft-consume-panel";

export default async function OrderFormDraftConsumePage({
  params,
}: {
  params: Promise<{ draftKey: string }>;
}) {
  const { draftKey } = await params;

  return <OrderFormDraftConsumePanel draftKey={decodeURIComponent(draftKey)} />;
}
