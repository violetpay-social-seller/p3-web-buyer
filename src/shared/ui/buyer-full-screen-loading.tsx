"use client";

/* eslint-disable @next/next/no-img-element */
import { cn } from "@/shared/lib/cn";

type BuyerFullScreenLoadingProps = {
  className?: string;
  label?: string;
};

export function BuyerFullScreenLoading({
  className,
  label = "처리 중입니다.",
}: BuyerFullScreenLoadingProps) {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "grid min-h-dvh place-items-center bg-[#383A41]",
        className,
      )}
      data-ui="buyer-full-screen-loading"
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-8 w-8 object-contain"
        src="/figma-flowmap/spinner.gif"
      />
      <span className="sr-only">{label}</span>
    </main>
  );
}
