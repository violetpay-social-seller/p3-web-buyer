"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { env } from "@/shared/config/env";
import { cn } from "@/shared/lib/cn";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  fallback?: ReactNode;
  fill?: boolean;
  src?: string | null;
};

export function SafeImage({
  alt = "",
  className,
  fallback = null,
  fill = false,
  onError,
  src,
  ...props
}: SafeImageProps) {
  const safeSrc = useMemo(() => normalizeImageSrc(src), [src]);
  const [failedSrc, setFailedSrc] = useState("");

  if (!safeSrc || failedSrc === safeSrc) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...props}
      alt={alt}
      className={cn(fill ? "absolute inset-0 h-full w-full" : undefined, className)}
      decoding="async"
      loading={props.loading ?? "lazy"}
      onError={(event) => {
        onError?.(event);
        setFailedSrc(safeSrc);
      }}
      src={safeSrc}
    />
  );
}

export function normalizeImageSrc(value?: string | null) {
  const candidate = getFirstStringValue(value);

  if (!candidate) return "";
  if (candidate.startsWith("/") || candidate.startsWith("blob:") || candidate.startsWith("data:")) return candidate;

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    if (!env.assetBaseUrl) return "";
    return `${env.assetBaseUrl.replace(/\/$/, "")}/${candidate.replace(/^\//, "")}`;
  }
}

function getFirstStringValue(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === "string") return parsed.trim();
    if (Array.isArray(parsed)) {
      return parsed.find((item): item is string => typeof item === "string" && item.trim().length > 0)?.trim() ?? "";
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
