import { useEffect } from "react";

/** Sets `document.title` as "<page> · SF UI". */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · SF UI` : "SF UI · Black Glass for React";
  }, [title]);
}
