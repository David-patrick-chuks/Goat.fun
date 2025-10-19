"use client";

import ChatPage from "@/components/chat/ChatPage";
import { Suspense } from "react";

export default function Chat() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPage />
    </Suspense>
  );
}
