import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck, IconClose } from "./icons";

export interface ToastState {
  message: string;
  type: "success" | "error";
}

export function useToast(duration = 2600) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, type: ToastState["type"] = "success") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, type });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const node = toast ? (
    <div
      className={`toast${toast.type === "error" ? " error" : ""}`}
      role="status"
    >
      {toast.type === "success" ? <IconCheck size={16} /> : <IconClose size={16} />}
      {toast.message}
    </div>
  ) : null;

  return { show, node };
}
