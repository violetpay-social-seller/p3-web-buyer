import { OrderDraftFlowPage } from "@/features/order-flow/order-draft-flow-page";

export default async function NewOrderFormDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { slug } = await params;
  const { step } = await searchParams;

  return <OrderDraftFlowPage initialStep={step} slug={decodeURIComponent(slug)} />;
}
