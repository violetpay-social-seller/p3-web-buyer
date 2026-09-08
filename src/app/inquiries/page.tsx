import { AuthenticatedBuyerPage } from "@/features/api-backed/authenticated-buyer-page";
import { buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;

  return <AuthenticatedBuyerPage context={state ? `state=${state}` : undefined} page={buyerPages.inquiries} />;
}
