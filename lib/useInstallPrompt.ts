"use client";

import { useEffect, useState } from "react";

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handler);

    function onInstalled() {
      setInstalled(true);
      setPrompt(null);
    }
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return { canInstall: !!prompt && !installed, install };
}
