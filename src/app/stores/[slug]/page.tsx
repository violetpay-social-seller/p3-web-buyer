import { BuyerBlueprintPage, buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";
import { getStore, getStoreOrderSettings } from "@/shared/api/buyer-api";

export default async function StoreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ agree?: string; banner?: string; gallery?: string; imageConfirm?: string; notice?: string; panel?: string; permission?: string; pickupDate?: string; pickupTime?: string; readonly?: string; returnTo?: string; startAssetId?: string; startSource?: string; startUploadKey?: string; tab?: string; upload?: string }>;
}) {
  const { slug } = await params;
  const { agree, banner, gallery, imageConfirm, notice, panel, permission, pickupDate, pickupTime, readonly, returnTo, startAssetId, startSource, startUploadKey, tab, upload } = await searchParams;
  const decodedSlug = decodeURIComponent(slug);
  const [from, to] = getOrderSettingRange();
  const [store, storeOrderSettings] = await Promise.all([
    getStore(decodedSlug),
    notice ? getStoreOrderSettings(decodedSlug, from, to).catch(() => undefined) : Promise.resolve(undefined),
  ]);
  const context = [
    `store slug = ${decodedSlug}`,
    panel ? `panel=${panel}` : "",
    notice ? `notice=${notice}` : "",
    agree ? `agree=${agree}` : "",
    readonly ? `readonly=${readonly}` : "",
    returnTo ? `returnTo=${encodeURIComponent(returnTo)}` : "",
    pickupDate ? `pickupDate=${encodeURIComponent(pickupDate)}` : "",
    pickupTime ? `pickupTime=${encodeURIComponent(pickupTime)}` : "",
    startAssetId ? `startAssetId=${encodeURIComponent(startAssetId)}` : "",
    startSource ? `startSource=${startSource}` : "",
    startUploadKey ? `startUploadKey=${encodeURIComponent(startUploadKey)}` : "",
    banner ? `banner=${banner}` : "",
    gallery ? `gallery=${gallery}` : "",
    imageConfirm ? `imageConfirm=${imageConfirm}` : "",
    permission ? `permission=${permission}` : "",
    tab ? `tab=${tab}` : "",
    upload ? `upload=${upload}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return <BuyerBlueprintPage apiData={{ store, storeOrderSettings }} context={context} page={buyerPages.storeDetail} />;
}

function getOrderSettingRange() {
  const today = new Date();
  const toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  return [toIsoDate(today), toIsoDate(toDate)] as const;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
