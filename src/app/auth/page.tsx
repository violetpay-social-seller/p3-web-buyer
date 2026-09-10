import { BuyerLoginRouteGuard } from "@/features/auth/buyer-login-route-guard";
import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <BuyerLoginRouteGuard>
      <BuyerBlueprintPage context={next ? `next=${encodeURIComponent(next)}` : undefined} page={buyerPages.auth} />
    </BuyerLoginRouteGuard>
  );
}
