"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastState = { text: string; bad?: boolean } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const notify = useCallback((text: string, bad = false) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ text, bad });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  return { toast, notify };
}
