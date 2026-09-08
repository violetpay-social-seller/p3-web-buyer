"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/cn";
import { SafeImage } from "@/shared/ui/safe-image";

export type ReferenceAssetPreview = {
  assetId?: string | null;
  deliveryUrl?: string | null;
  sortOrder?: number | null;
  source?: string | null;
};

export function ReferenceAssetPreviewGrid({
  assets,
  className,
  emptyLabel = "참고 이미지",
  itemClassName,
}: {
  assets: ReferenceAssetPreview[];
  className?: string;
  emptyLabel?: string;
  itemClassName?: string;
}) {
  const sortedAssets = useMemo(
    () =>
      [...assets]
        .filter((asset) => asset.assetId || asset.deliveryUrl)
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)),
    [assets],
  );

  if (!sortedAssets.length) {
    return (
      <div className={cn("grid place-items-center bg-[var(--figma-color-surface-subtle)] text-label-sm text-[var(--figma-color-text-tertiary)]", className)}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn("grid overflow-hidden bg-[var(--figma-color-surface-subtle)]", sortedAssets.length > 1 ? "grid-cols-2 gap-1" : "grid-cols-1", className)}>
      {sortedAssets.slice(0, 4).map((asset, index) => (
        <div className={cn("relative min-h-0 min-w-0 overflow-hidden bg-white", itemClassName)} key={`${asset.assetId ?? asset.deliveryUrl}-${index}`}>
          {asset.deliveryUrl ? (
            <SafeImage alt={`참고 이미지 ${index + 1}`} className="object-cover" fill sizes="160px" src={asset.deliveryUrl} />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-sm)] text-center text-label-sm text-[var(--figma-color-text-tertiary)]">
              이미지 준비 중
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
