import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default function ErrorPage() {
  return <BuyerBlueprintPage context="reason=generic" page={buyerPages.error} />;
}
