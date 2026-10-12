"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";

const CODE = /([A-F0-9]{32})(?:[/?#]|$)/i;
const REPEAT_MS = 3000;

export function TicketScanner({ onCode }: { onCode: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const handler = useRef(onCode);
  const [error, setError] = useState("");

  useEffect(() => {
    handler.current = onCode;
  }, [onCode]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let stopped = false;
    let last = { code: "", at: 0 };
    let scanner: { stop: () => void; destroy: () => void } | null = null;

    import("qr-scanner").then(async ({ default: QrScanner }) => {
      if (stopped) return;
      const instance = new QrScanner(
        element,
        (result) => {
          const code = CODE.exec(result.data)?.[1]?.toUpperCase();
          const now = Date.now();
          if (!code || (code === last.code && now - last.at < REPEAT_MS)) {
            return;
          }
          last = { code, at: now };
          handler.current(code);
        },
        { preferredCamera: "environment", maxScansPerSecond: 5 },
      );
      scanner = instance;
      try {
        await instance.start();
      } catch {
        setError(
          "Couldn't open the camera. Allow camera access, or search below.",
        );
      }
    });

    return () => {
      stopped = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden bg-muted">
        <video
          ref={video}
          muted
          playsInline
          className="size-full object-cover"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[18%] border-2 border-primary"
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
