"use client";

import { useEffect, useState } from "react";
import { getOrderFormSubmission, type OrderFormSubmissionResponse } from "@/shared/api/buyer-api";
import { parseOrderSummaryRows } from "@/shared/lib/order-summary-format";
import { FlowCard, FlowCardAction } from "@/shared/ui/flow-card";
import { ReferenceAssetPreviewGrid } from "@/features/order-flow/reference-asset-preview-grid";
import { getOrderFormSubmissionReferenceAssets } from "@/features/order-flow/submission-reference-assets";
import { hydrateOrderFormSubmissionReferenceAssetUrls } from "@/features/order-flow/submission-reference-asset-hydration";

type SubmissionCardState =
  | { status: "loading"; submission?: undefined }
  | { status: "error"; submission?: undefined }
  | { status: "success"; submission: OrderFormSubmissionResponse };

export function OrderFormSubmissionCard({
  inquiryId,
  submissionId,
}: {
  inquiryId: string;
  submissionId: string;
}) {
  const [state, setState] = useState<SubmissionCardState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getOrderFormSubmission(inquiryId, submissionId)
      .then(hydrateOrderFormSubmissionReferenceAssetUrls)
      .then((submission) => {
        if (!cancelled) setState({ status: "success", submission });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId, submissionId]);

  const rows = state.status === "success" ? parseOrderSummaryRows(state.submission.answers) : [];
  const title = rows[0]?.value || (state.status === "loading" ? "주문서를 불러오는 중입니다" : "주문서가 접수되었습니다");
  const subtitle = rows
    .slice(1, 3)
    .map((row) => row.value)
    .filter(Boolean)
    .join(" / ");
  const previewAssets = state.status === "success" ? getOrderFormSubmissionReferenceAssets(state.submission) : [];

  return (
    <FlowCard className="w-[240px] shrink-0 rounded-[24px] px-[var(--figma-space-md)] py-[var(--figma-space-md)]" data-ui="order-form-submission-card">
      <ReferenceAssetPreviewGrid assets={previewAssets} className="h-[208px] w-[208px] rounded-[var(--figma-radius-sm)]" itemClassName="h-full w-full" />
      <h2 className="mt-[var(--figma-space-md)] line-clamp-1 text-heading-md">{title}</h2>
      {subtitle ? <p className="mt-[var(--figma-space-xs)] line-clamp-1 text-label-sm text-[var(--figma-color-text-tertiary)]">{subtitle}</p> : null}
      <FlowCardAction className="mt-[var(--figma-space-md)] h-9 w-full rounded-[var(--figma-radius-lg)]" href={`/inquiries/${encodeURIComponent(inquiryId)}/order-form-submissions/${encodeURIComponent(submissionId)}`} variant="secondary">
        주문서 보기
      </FlowCardAction>
    </FlowCard>
  );
}
