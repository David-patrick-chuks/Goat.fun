"use client";

import type { BackendMarket } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { Play, Square, Mic, MicOff, Video, VideoOff, Users, MessageCircle, Settings } from "lucide-react";

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
  const [showControls, setShowControls] = useState(false);

  // Handle connecting to streamer
  const handleConnectToStreamer = async () => {
    if (!market?.creator || !onConnectToStreamer) return;
    
    setCurrentStreamerWallet(market.creator);
    onConnectToStreamer(market.creator);
    setIsPlaying(true);
  };

  // Handle disconnecting from streamer
  const handleDisconnectFromStreamer = () => {
    console.log('[streamplayer] Disconnecting from streamer:', currentStreamerWallet);
    if (!currentStreamerWallet || !onDisconnectFromStreamer) {
      console.log('[streamplayer] No streamer wallet or disconnect function available');
      return;
    }
    
    onDisconnectFromStreamer(currentStreamerWallet);
    setCurrentStreamerWallet(null);
    setIsPlaying(false);
    console.log('[streamplayer] Disconnected from streamer');
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
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Stream Container */}
      <div 
        className="relative aspect-video bg-black"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {isStreamer ? (
          /* Streamer's view */
          isStreaming ? (
            <div className="relative w-full h-full">
              <video 
                ref={videoElementRef}
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline
                muted
                controls={false}
              />
              
              {/* Streamer Controls Overlay */}
              <div className={`absolute top-4 left-4 flex gap-2 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                <button
                  onClick={onToggleMute}
                  className={`p-2 rounded-full ${isMuted ? 'bg-red-600' : 'bg-black/50'} text-white hover:bg-opacity-80 transition-colors`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={onToggleCamera}
                  className={`p-2 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-black/50'} text-white hover:bg-opacity-80 transition-colors`}
                >
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-full bg-black/50 text-white hover:bg-opacity-80 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              {/* Stop Stream Button */}
              <button
                onClick={() => {
                  // This would call the stop stream function
                  console.log('Stop stream clicked');
                }}
                className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4 inline mr-2" />
                End Stream
              </button>
            </div>
          ) : (
            /* Streamer not streaming */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Your Stream</h3>
                <p className="text-gray-400 text-sm mb-4">Share your market insights live</p>
                <button
                  onClick={() => {
                    // This would call the start stream function
                    console.log('Start stream clicked');
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go Live
                </button>
              </div>
            </div>
          )
        ) : (
          /* Viewer's view */
          market?.livestream?.isLive ? (
            <div className="relative w-full h-full">
              {isPlaying ? (
                /* Show video player when playing */
                <video 
                  ref={viewerVideoRef}
                  className="w-full h-full object-cover" 
                  autoPlay 
                  playsInline
                  controls={true}
                />
              ) : (
                /* Show play button when not playing */
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">🔴 LIVE</h3>
                      {viewers > 0 && (
                        <p className="text-gray-400 text-sm mb-4">
                          {viewers} viewer{viewers !== 1 ? 's' : ''} watching
                        </p>
                      )}
                    </div>
                    
                    {address ? (
                      <button 
                        onClick={handleConnectToStreamer}
                        disabled={isConnecting}
                        className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors ${
                          isConnecting 
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Watch Stream
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-400 mb-4">Connect your wallet to watch the stream</p>
                        <button 
                          onClick={() => window.location.reload()}
                          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    )}
                    
                    {/* Request to join button for participation */}
                    {address && (
                      <button 
                        onClick={onRequestToJoin}
                        className="mt-4 px-4 py-2 rounded text-sm bg-blue-500/20 text-blue-300 border border-blue-300/30 hover:bg-blue-500/30 transition-colors"
                      >
                        Request to Join & Talk
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Stop Watching Button */}
              {isPlaying && (
                <button
                  onClick={handleDisconnectFromStreamer}
                  className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Stop Watching
                </button>
              )}
            </div>
          ) : (
            /* Stream not live */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">⏸️ Offline</h3>
                <p className="text-gray-400 text-sm">Stream is not currently live</p>
              </div>
            </div>
          )
        )}
        
        {/* Live Indicator */}
        {market?.livestream?.isLive && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        )}
        
        {/* Viewer Count */}
        {viewers > 0 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" />
            {viewers}
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="absolute bottom-4 left-4 bg-red-600/90 text-white text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
      
      {/* Stream Info Bar */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {market?.creator?.slice(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <p className="text-sm font-medium">{market?.creator?.slice(0, 6)}...{market?.creator?.slice(-4)}</p>
                <p className="text-xs text-gray-400">
                  {market?.livestream?.isLive ? 'Streaming live' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}