"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { PendingUploadPreviewImage } from "@/features/flow-blueprint/pending-upload-preview-image";
import { getStoreGalleryItems, type GalleryItemResponse } from "@/shared/api/buyer-api";
import { validateImageUploadFile } from "@/shared/lib/image-upload-validation";
import { persistPendingUpload } from "@/shared/lib/pending-image-upload-store";
import { SafeImage } from "@/shared/ui/safe-image";

export function StoreOrderSection({
  defaultTab = "best",
  galleryExpanded = false,
  initialPermissionOpen = false,
  initialUploaded = false,
  storeSlug,
}: {
  defaultTab?: "best" | "other";
  galleryExpanded?: boolean;
  initialPermissionOpen?: boolean;
  initialUploaded?: boolean;
  storeSlug: string;
}) {
  const [tab, setTab] = useState<"best" | "other">(defaultTab);
  const [permissionOpen, setPermissionOpen] = useState(initialPermissionOpen);
  const [uploaded, setUploaded] = useState(initialUploaded);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [galleryItems, setGalleryItems] = useState<GalleryItemResponse[]>([]);
  const [confirmGalleryItem, setConfirmGalleryItem] = useState<GalleryItemResponse | null>(null);
  const [confirmUploadKey, setConfirmUploadKey] = useState("");
  const canContinueOther = Boolean(selectedUploadFile);

  useEffect(() => {
    let cancelled = false;

    getStoreGalleryItems(storeSlug)
      .then((items) => {
        if (!cancelled) setGalleryItems(items);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  async function handleOtherNext() {
    setUploadError("");

    if (!selectedUploadFile) return;

    setUploading(true);
    try {
      const { uploadKey } = await persistPendingUpload(selectedUploadFile, "user-upload");
      setUploaded(true);
      setConfirmUploadKey(uploadKey);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "이미지를 임시 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="min-w-0 overflow-x-hidden bg-white pb-[34px]" data-ui="store-order-section">
      <div className="flex min-w-0 flex-col px-[var(--figma-space-md)] pb-[var(--figma-space-md)] pt-[var(--figma-space-md)]">
        <div className="flex h-12 min-w-0 flex-col gap-[2px]">
          <h2 className="text-heading-lg">주문하기</h2>
          <p className="min-w-0 break-words text-body-sm text-[var(--figma-color-text-secondary)]">마음에 드는 디자인을 바로 주문하실 수 있어요</p>
        </div>
        <div className="mt-[var(--figma-space-lg)] flex min-w-0 gap-[var(--figma-space-sm)]">
          <button className={`figma-order-tab ${tab === "best" ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-secondary)]"}`} onClick={() => setTab("best")} type="button">
            Best
          </button>
          <button className={`figma-order-tab ${tab === "other" ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-secondary)]"}`} onClick={() => setTab("other")} type="button">
            Other
          </button>
        </div>
      </div>
      {tab === "best" ? (
        <BestOrderGrid expanded={galleryExpanded} galleryItems={galleryItems} onImageSelect={setConfirmGalleryItem} storeSlug={storeSlug} />
      ) : (
        <OtherOrderUpload
          onRejected={(message) => {
            setSelectedUploadFile(null);
            setUploaded(false);
            setUploadedUrl("");
            setUploadError(message);
          }}
          onSelected={(file, previewUrl) => {
            setSelectedUploadFile(file);
            setUploaded(false);
            setUploadedUrl(previewUrl);
            setUploadError("");
          }}
          uploadError={uploadError}
          uploading={uploading}
          uploaded={uploaded}
          uploadedUrl={uploadedUrl}
        />
      )}
      {tab === "other" ? (
        <div className="min-w-0 px-[var(--figma-space-md)] pt-[var(--figma-space-md)]">
          <button
            className={`h-[52px] w-full rounded-[var(--figma-radius-md)] text-heading-md ${canContinueOther ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-action-disabled)] text-[var(--figma-color-text-disabled)]"}`}
            disabled={!canContinueOther || uploading}
            onClick={() => void handleOtherNext()}
            type="button"
          >
            {uploading ? "업로드 중" : "다음"}
          </button>
        </div>
      ) : null}
      {permissionOpen ? (
        <PhotoPermissionDialog
          onBack={() => setPermissionOpen(false)}
          onSettings={() => {
            setPermissionOpen(false);
          }}
        />
      ) : null}
      {confirmGalleryItem || confirmUploadKey ? (
        <ImageConfirmSheet
          galleryItem={confirmGalleryItem}
          onClose={() => {
            setConfirmGalleryItem(null);
            setConfirmUploadKey("");
          }}
          storeSlug={storeSlug}
          uploadKey={confirmUploadKey}
        />
      ) : null}
    </section>
  );
}

function BestOrderGrid({
  expanded,
  galleryItems,
  onImageSelect,
  storeSlug,
}: {
  expanded: boolean;
  galleryItems: GalleryItemResponse[];
  onImageSelect: (item: GalleryItemResponse) => void;
  storeSlug: string;
}) {
  const displayableItems = galleryItems.filter((item) => getGalleryImageUrl(item, "THUMBNAIL"));
  const images = expanded ? displayableItems : displayableItems.slice(0, 6);

  return (
    <div className="min-w-0 overflow-x-hidden px-[var(--figma-space-md)]">
      {images.length ? (
        <>
          <div className="grid min-w-0 grid-cols-2 gap-1">
            {images.map((item, index) => (
              <button className="relative aspect-square overflow-hidden rounded-[var(--figma-radius-sm)]" key={item.id} onClick={() => onImageSelect(item)} type="button">
                <SafeImage alt={`주문 가능 이미지 ${index + 1}`} className="object-cover" fill sizes="177px" src={getGalleryImageUrl(item, "THUMBNAIL")} />
              </button>
            ))}
          </div>
          {displayableItems.length > 6 ? (
            <Link className="mt-[var(--figma-space-xs)] flex h-[52px] w-full items-center justify-center gap-[var(--figma-space-xs)] rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-5 py-[var(--figma-space-md)] text-label-md text-[var(--figma-color-text-secondary)]" href={expanded ? `/stores/${encodeURIComponent(storeSlug)}` : `/stores/${encodeURIComponent(storeSlug)}?gallery=expanded`}>
              더보기
              <span className="grid h-[30px] w-9 place-items-center">
                <ChevronDown aria-hidden="true" className="h-[30px] w-9 text-[var(--figma-color-text-tertiary)]" strokeWidth={3} />
              </span>
            </Link>
          ) : null}
        </>
      ) : (
        <div className="grid min-h-[160px] place-items-center rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-center text-body-sm text-[var(--figma-color-text-secondary)]">
          주문 가능한 이미지가 없습니다.
        </div>
      )}
    </div>
  );
}

export function getGalleryImageUrl(item: GalleryItemResponse | undefined, preferredVariant?: string) {
  if (!item) return null;
  const variants = Array.isArray(item.variants) ? item.variants : [];
  return variants.find((variant) => variant.type === preferredVariant)?.deliveryUrl ?? item.deliveryUrl ?? variants[0]?.deliveryUrl ?? null;
}

function ImageConfirmSheet({
  galleryItem,
  onClose,
  storeSlug,
  uploadKey,
}: {
  galleryItem: GalleryItemResponse | null;
  onClose: () => void;
  storeSlug: string;
  uploadKey?: string;
}) {
  const storePath = `/stores/${encodeURIComponent(storeSlug)}`;
  const selectedImageUrl = getGalleryImageUrl(galleryItem ?? undefined, "MEDIUM");
  const orderParams = new URLSearchParams({ step: "pickup-date" });

  if (uploadKey) {
    orderParams.set("startUploadKey", uploadKey);
    orderParams.set("startSource", "USER_UPLOAD");
  } else if (galleryItem?.assetId) {
    orderParams.set("startAssetId", galleryItem.assetId);
    orderParams.set("startSource", "STORE_GALLERY");
  }

  const orderHref = `${storePath}/order-form-drafts/new?${orderParams.toString()}`;

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 mx-auto flex w-full max-w-[var(--figma-container-lg)] flex-col justify-end overflow-x-hidden bg-[var(--figma-color-surface-scrim)]">
      <div className="flex w-full min-w-0 flex-col items-center gap-[var(--figma-space-lg)] rounded-t-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-xl)]">
        <div className="flex w-full min-w-0 items-start justify-between">
          <h2 className="text-heading-lg">
            선택한 케이크 이미지로
            <br />
            주문하시겠어요?
          </h2>
          <button aria-label="닫기" className="relative h-12 w-12 shrink-0" onClick={onClose} type="button">
            <Image alt="" height={48} src="/figma-flowmap/cancel.svg" width={48} />
          </button>
        </div>
        <div className="relative grid aspect-square w-full min-w-0 max-w-full place-items-center overflow-hidden rounded-[21px] bg-[var(--figma-color-surface-subtle)] text-body-sm text-[var(--figma-color-text-tertiary)]">
          {selectedImageUrl ? (
            <SafeImage alt="선택한 케이크 이미지" className="object-cover" fill sizes="358px" src={selectedImageUrl} />
          ) : uploadKey ? (
            <PendingUploadPreviewImage uploadKey={uploadKey} />
          ) : (
            "선택한 이미지"
          )}
        </div>
        <div className="flex w-full min-w-0 gap-[var(--figma-space-sm)]">
          <button className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-strong)] px-[var(--figma-space-lg)] text-label-md text-[var(--figma-color-text-tertiary)]" onClick={onClose} type="button">
            둘러보기
          </button>
          <Link className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] px-[var(--figma-space-lg)] text-label-md text-white" href={orderHref}>
            주문하기
          </Link>
        </div>
      </div>
    </div>
  );
}

function OtherOrderUpload({
  onRejected,
  onSelected,
  uploadError,
  uploading,
  uploaded,
  uploadedUrl,
}: {
  onRejected: (message: string) => void;
  onSelected: (file: File, previewUrl: string) => void;
  uploadError: string;
  uploading: boolean;
  uploaded: boolean;
  uploadedUrl: string;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const displayUrl = previewUrl || uploadedUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFile(file?: File) {
    if (!file) {
      return;
    }

    const validationError = validateImageUploadFile(file);
    if (validationError) {
      setPreviewUrl("");
      onRejected(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onSelected(file, objectUrl);
  }

  return (
    <div className="min-w-0 overflow-x-hidden px-[var(--figma-space-md)]">
      <label
        className={`relative grid w-full min-w-0 max-w-full place-items-center overflow-hidden rounded-[var(--figma-radius-sm)] ${displayUrl ? "aspect-square bg-white" : "h-[100px] bg-[var(--figma-color-surface-subtle)] text-[26px] text-[var(--figma-color-text-tertiary)]"}`}
      >
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
          type="file"
        />
        {displayUrl ? (
          <SafeImage alt="업로드한 참고 이미지" className="object-cover" fill sizes="358px" src={displayUrl} />
        ) : (
          <span className="grid h-12 w-12 place-items-center">
            {uploading ? "..." : <Image alt="" aria-hidden height={48} src="/figma-flowmap/upload.svg" width={48} />}
          </span>
        )}
      </label>
      {uploading || uploaded || uploadError ? (
        <p className={`mt-[var(--figma-space-sm)] text-label-xs ${uploadError ? "text-[var(--figma-color-status-error)]" : "text-[var(--figma-color-text-tertiary)]"}`}>
          {uploadError || (uploading ? "이미지를 업로드하는 중입니다." : "이미지 처리 중입니다. 잠시 후 주문에 사용할 수 있어요.")}
        </p>
      ) : null}
      <p className="mt-[var(--figma-space-md)] text-body-sm text-[var(--figma-color-text-secondary)]">
        wihada 플랫폼에서 확인이 어려운 케이크 디자인은 인스타에서 캡쳐해주시면 주문 도와드리고 있어요
      </p>
    </div>
  );
}

function PhotoPermissionDialog({ onBack, onSettings }: { onBack: () => void; onSettings: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--figma-color-surface-scrim)] px-[32px]">
      <div className="mx-auto min-h-[182px] w-full max-w-[326px] rounded-[24px] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-md)] pt-[32px] text-center shadow-[var(--figma-shadow-dropdown)]">
        <h3 className="text-heading-md">사진 접근 권한이 필요합니다</h3>
        <p className="mt-[var(--figma-space-xs)] text-label-sm text-[var(--figma-color-text-secondary)]">설정에서 사진 접근을 허용해주세요</p>
        <div className="mt-[var(--figma-space-lg)] flex gap-[var(--figma-space-sm)]">
          <button className="h-11 flex-1 rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-strong)] bg-white text-label-md" onClick={onBack} type="button">
            돌아가기
          </button>
          <button className="h-11 flex-1 rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" onClick={onSettings} type="button">
            설정으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
