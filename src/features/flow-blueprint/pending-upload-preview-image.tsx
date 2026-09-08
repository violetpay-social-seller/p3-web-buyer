"use client";

import { useEffect, useState } from "react";
import { readPendingUpload } from "@/shared/lib/pending-image-upload-store";
import { SafeImage } from "@/shared/ui/safe-image";

export function PendingUploadPreviewImage({ uploadKey }: { uploadKey?: string }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    readPendingUpload(uploadKey).then((record) => {
      if (!active || !record?.file) return;
      objectUrl = URL.createObjectURL(record.file);
      setPreviewUrl(objectUrl);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uploadKey]);

  if (!previewUrl) {
    return <span>선택한 이미지</span>;
  }

  return <SafeImage alt="업로드한 케이크 이미지" className="object-cover" fill sizes="358px" src={previewUrl} />;
}
