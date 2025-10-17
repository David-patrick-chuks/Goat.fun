"use client";

import type { BackendMarket } from "@/lib/types";
import React from "react";

interface StreamPlayerProps {
  market: BackendMarket | null;
  isStreamer: boolean;
  isStreaming: boolean;
  localStream: MediaStream | null;
  viewers: number;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
  onRequestToJoin: () => void;
  address: string | undefined;
}

export default function StreamPlayer({
  market,
  isStreamer,
  isStreaming,
  localStream,
  viewers,
  videoElementRef,
  onRequestToJoin,
  address
}: StreamPlayerProps) {
  return (
    <div className="flex-1 rounded bg-black/40 border border-white/10 flex flex-col min-h-[400px]">
      {isStreamer ? (
        /* Streamer's view - can start/stop stream */
        isStreaming ? (
          <>
            {/* Streamer's video (main display) */}
            <div className="flex-1 relative">
              <video 
                ref={videoElementRef}
                className="w-full h-full rounded object-cover" 
                autoPlay 
                playsInline
                muted
                controls={false}
              />
              
              {viewers > 0 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {viewers} viewer{viewers !== 1 ? 's' : ''}
                </div>
              )}
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white/60">
                  Starting stream...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/60">
            Click &quot;Start Stream&quot; to begin streaming
          </div>
        )
      ) : (
        /* Viewer's view - can only watch or request to join */
        market?.livestream?.isLive ? (
          <div className="flex-1 flex items-center justify-center text-white/60">
            <div className="text-center">
              <div className="text-lg mb-4">🔴 LIVE</div>
              <div className="text-sm mb-4">Stream is live - Click play to watch</div>
              
              {/* Play button to watch the stream */}
              <button 
                onClick={() => {
                  // In a real implementation, this would start playing the stream
                  console.log('Playing livestream...');
                  alert('Stream playback would start here');
                }}
                className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium mb-4 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play Stream
              </button>
              
              {/* Request to join button for participation */}
              {address && (
                <button 
                  onClick={onRequestToJoin}
                  className="px-4 py-2 rounded text-sm bg-blue-500/20 text-blue-300 border border-blue-300/30 hover:bg-blue-500/30"
                >
                  Request to Join & Talk
                </button>
              )}
              
              {viewers > 0 && (
                <div className="text-xs text-white/50 mt-4">
                  {viewers} viewer{viewers !== 1 ? 's' : ''} watching
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/60">
            <div className="text-center">
              <div className="text-lg mb-2">⏸️ Offline</div>
              <div className="text-sm">Stream is not currently live</div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
