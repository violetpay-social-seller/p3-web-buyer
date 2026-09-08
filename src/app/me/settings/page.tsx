import { AuthenticatedBuyerPage } from "@/features/api-backed/authenticated-buyer-page";
import { buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";

export default function MeSettingsPage() {
  return <AuthenticatedBuyerPage page={buyerPages.settings} />;
}
