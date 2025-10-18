"use client";

import type { BackendMarket } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";

interface StreamPlayerProps {
  market: BackendMarket | null;
  isStreamer: boolean;
  isStreaming: boolean;
  localStream: MediaStream | null;
  viewers: number;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
  onRequestToJoin: () => void;
  address: string | undefined;
  isMuted?: boolean;
  isCameraOff?: boolean;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  // WebRTC props
  remoteStreams?: Map<string, MediaStream>;
  onConnectToStreamer?: (streamerWallet: string) => void;
  onDisconnectFromStreamer?: (streamerWallet: string) => void;
  isConnecting?: boolean;
  error?: string | null;
}

export default function StreamPlayer({
  market,
  isStreamer,
  isStreaming,
  localStream,
  viewers,
  videoElementRef,
  onRequestToJoin,
  address,
  isMuted = false,
  isCameraOff = false,
  onToggleMute,
  onToggleCamera,
  remoteStreams = new Map(),
  onConnectToStreamer,
  onDisconnectFromStreamer,
  isConnecting = false,
  error = null
}: StreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const viewerVideoRef = useRef<HTMLVideoElement>(null);
  const [currentStreamerWallet, setCurrentStreamerWallet] = useState<string | null>(null);

  // Handle connecting to streamer
  const handleConnectToStreamer = async () => {
    if (!market?.creator || !onConnectToStreamer) return;
    
    setCurrentStreamerWallet(market.creator);
    onConnectToStreamer(market.creator);
    setIsPlaying(true);
  };

  // Handle disconnecting from streamer
  const handleDisconnectFromStreamer = () => {
    if (!currentStreamerWallet || !onDisconnectFromStreamer) return;
    
    onDisconnectFromStreamer(currentStreamerWallet);
    setCurrentStreamerWallet(null);
    setIsPlaying(false);
  };

  // Update viewer video when remote stream changes
  useEffect(() => {
    if (viewerVideoRef.current && remoteStreams.size > 0) {
      const firstStream = Array.from(remoteStreams.values())[0];
      viewerVideoRef.current.srcObject = firstStream;
      viewerVideoRef.current.play();
    }
  }, [remoteStreams]);
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
                
                {/* Stream Video Controls */}
                {localStream && onToggleMute && onToggleCamera && (
                  <div className="absolute top-2 left-2 flex gap-2">
                    <button
                      onClick={onToggleMute}
                      className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-black/50'} text-white hover:bg-opacity-80 transition-all`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L5.414 14H3a1 1 0 01-1-1V7a1 1 0 011-1h2.414l3.969-2.794a1 1 0 011-.13zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L5.414 14H3a1 1 0 01-1-1V7a1 1 0 011-1h2.414l3.969-2.794a1 1 0 011-.13zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={onToggleCamera}
                      className={`p-2 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-black/50'} text-white hover:bg-opacity-80 transition-all`}
                      title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                      {isCameraOff ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12V5H4v10h12z" clipRule="evenodd" />
                          <path d="M8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
                
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
          <div className="flex-1 flex flex-col">
            {isPlaying ? (
              /* Show video player when playing */
              <div className="flex-1 relative">
                <video 
                  ref={viewerVideoRef}
                  className="w-full h-full rounded object-cover" 
                  autoPlay 
                  playsInline
                  controls={true}
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  🔴 LIVE
                </div>
                <button
                  onClick={handleDisconnectFromStreamer}
                  className="absolute top-2 left-2 px-3 py-1 bg-red-500/80 text-white text-sm rounded hover:bg-red-500"
                >
                  Stop Watching
                </button>
                {error && (
                  <div className="absolute bottom-2 left-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              /* Show play button when not playing */
              <div className="flex-1 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <div className="text-lg mb-4">🔴 LIVE</div>
                  <div className="text-sm mb-4">Stream is live - Click play to watch</div>
                  
                  {/* Play button to watch the stream */}
                  <button 
                    onClick={handleConnectToStreamer}
                    disabled={isConnecting}
                    className={`px-6 py-3 rounded-lg font-medium mb-4 flex items-center gap-2 mx-auto ${
                      isConnecting 
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    {isConnecting ? 'Connecting...' : 'Play Stream'}
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
                  
                  {error && (
                    <div className="text-xs text-red-400 mt-2">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
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
