import { describe, expect, it } from "vitest";
import { getOrderFormSubmissionReferenceAssets } from "./submission-reference-assets";

describe("submission-reference-assets", () => {
  it("uses structured submission reference asset snapshots", () => {
    expect(
      getOrderFormSubmissionReferenceAssets({
        answers: "{}",
        cancellationRefundAgreed: true,
        id: "submission-1",
        inquiryId: "inquiry-1",
        pickupDate: "2026-09-07",
        pickupTime: "15:30",
        referenceAssets: [
          {
            assetId: "asset-1",
            deliveryUrl: "https://cdn.example.com/cake.jpg",
            sortOrder: 0,
            source: "STORE_GALLERY",
          },
        ],
        submittedAt: "2026-09-07T00:00:00Z",
        submittedBy: "buyer-1",
        templateId: "template-1",
      }),
    ).toEqual([
      {
        assetId: "asset-1",
        deliveryUrl: "https://cdn.example.com/cake.jpg",
        sortOrder: 0,
        source: "STORE_GALLERY",
      },
    ]);
  });

  it("supports legacy stringified submission reference asset snapshots", () => {
    expect(
      getOrderFormSubmissionReferenceAssets({
        answers: "{}",
        cancellationRefundAgreed: true,
        id: "submission-1",
        inquiryId: "inquiry-1",
        pickupDate: "2026-09-07",
        pickupTime: "15:30",
        referenceAssets: JSON.stringify({
          referenceAssets: [
            {
              assetId: "asset-2",
              deliveryUrl: "https://cdn.example.com/upload.jpg",
              source: "USER_UPLOAD",
            },
          ],
        }),
        submittedAt: "2026-09-07T00:00:00Z",
        submittedBy: "buyer-1",
        templateId: "template-1",
      }),
    ).toEqual([
      {
        assetId: "asset-2",
        deliveryUrl: "https://cdn.example.com/upload.jpg",
        sortOrder: 0,
        source: "USER_UPLOAD",
      },
    ]);
  });

  it("does not invent delivery URLs from asset IDs", () => {
    expect(
      getOrderFormSubmissionReferenceAssets({
        answers: "{}",
        cancellationRefundAgreed: true,
        id: "submission-1",
        inquiryId: "inquiry-1",
        pickupDate: "2026-09-07",
        pickupTime: "15:30",
        referenceAssets: [{ assetId: "asset-without-url", source: "STORE_GALLERY" }],
        submittedAt: "2026-09-07T00:00:00Z",
        submittedBy: "buyer-1",
        templateId: "template-1",
      }),
    ).toEqual([
      {
        assetId: "asset-without-url",
        deliveryUrl: null,
        sortOrder: 0,
        source: "STORE_GALLERY",
      },
    ]);
  });
});
