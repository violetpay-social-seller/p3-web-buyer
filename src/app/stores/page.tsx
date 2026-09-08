import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";
import { getStores } from "@/shared/api/buyer-api";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const stores = await getStores().then((page) => page.items).catch(() => []);

  return <BuyerBlueprintPage apiData={{ stores }} page={buyerPages.stores} />;
}
