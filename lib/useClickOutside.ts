import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(onOutsideClick: () => void, active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [active, onOutsideClick]);

  return ref;
}
