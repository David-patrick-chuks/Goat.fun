"use client";

import MainContent from "@/components/home/MainContent";
import { initConsoleWarning } from "@/lib/consoleWarning";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const consoleWarning = initConsoleWarning({
      showOnLoad: true,
      detectDevTools: true,
      overrideConsoleLog: true,
      checkInterval: 500
    });

    return () => {
      consoleWarning.destroy();
    };
  }, []);

  return <MainContent />;
}
