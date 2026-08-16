"use client";

import { useState } from "react";
import { clearStoredTokens, getStoredTokens, type StoredAuthTokens } from "@/shared/auth/token-store";
import { uploadAsset } from "@/features/auth/auth-api";

export function AuthStatusCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [tokens] = useState<StoredAuthTokens | null>(() => getStoredTokens());
  const accessTokenPreview = tokens?.accessToken ? `${tokens.accessToken.slice(0, 18)}...${tokens.accessToken.slice(-10)}` : "없음";

  async function handleUpload() {
    if (!selectedFile) {
      setUploadError("업로드할 파일을 선택하세요.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadResult("");

    try {
      const result = await uploadAsset(selectedFile);
      setUploadResult(JSON.stringify(result, null, 2));
      console.info("[auth-debug] POST /assets success", result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Asset upload failed";
      setUploadError(message);
      console.error("[auth-debug] POST /assets failed", error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-5">
      <h2 className="text-lg font-bold">개발용 토큰 확인</h2>
      <div className="mt-4 grid gap-3 text-sm font-semibold">
        <InfoLine label="Access Token" value={accessTokenPreview} />
        <InfoLine label="만료 시각" value={tokens ? new Date(tokens.expiresAt).toLocaleString() : "없음"} />
      </div>

      <div className="mt-5 grid gap-3 border-t-2 border-[var(--color-border-subtle)] pt-5">
        <h3 className="font-bold">POST /assets 테스트</h3>
        <input
          className="rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] p-2 text-sm font-semibold"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        <button
          className="min-h-[var(--size-control-height)] rounded-[var(--radius-control)] bg-[var(--color-brand-space)] px-4 text-sm font-bold text-white disabled:opacity-[var(--opacity-disabled)]"
          disabled={isUploading}
          onClick={handleUpload}
          type="button"
        >
          {isUploading ? "업로드 중" : "POST /assets 호출"}
        </button>
        {uploadError ? <p className="text-sm font-bold text-[var(--color-brand-orange)]">{uploadError}</p> : null}
        {uploadResult ? (
          <pre className="overflow-x-auto rounded-[var(--radius-control)] bg-[var(--color-brand-space)] p-3 text-xs font-semibold text-white">
            {uploadResult}
          </pre>
        ) : null}
      </div>

      <button
        className="mt-5 min-h-[var(--size-control-height)] rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] px-4 text-sm font-bold"
        onClick={() => {
          clearStoredTokens();
          window.location.reload();
        }}
        type="button"
      >
        로컬 토큰 삭제
      </button>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b-2 border-[var(--color-border-subtle)] pb-2 last:border-b-0">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
