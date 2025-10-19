"use client";

import React from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Play, Square, Mic, MicOff, Video, VideoOff, Users, MessageCircle } from "lucide-react";

interface MarketLivestreamProps {
  market: any;
  marketId: string;
  address: string | undefined;
  isStreamer: boolean;
}

export default function MarketLivestream({ market, marketId, address, isStreamer }: MarketLivestreamProps) {
  const {
    localStream,
    remoteStreams,
    viewerCount,
    startWebRTCStream,
    stopWebRTCStream,
    connectToStreamer,
    disconnectFromStreamer,
    isConnecting,
    error: webrtcError
  } = useWebRTC({
    marketId,
    wallet: address || '',
    isStreamer
  });

  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showChat, setShowChat] = React.useState(true);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const localVideoRef = React.useRef<HTMLVideoElement>(null);

  // Update local video when stream starts
  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update remote video when remote streams change
  React.useEffect(() => {
    if (videoRef.current && remoteStreams.size > 0) {
      const firstStream = Array.from(remoteStreams.values())[0];
      videoRef.current.srcObject = firstStream;
    }
  }, [remoteStreams]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const handleStartStream = async () => {
    if (!address) return;
    try {
      await startWebRTCStream();
      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const handleStopStream = () => {
    stopWebRTCStream();
    setIsStreaming(false);
    setIsPlaying(false);
  };

  const handlePlayStream = async () => {
    if (!market.creator) return;
    try {
      await connectToStreamer(market.creator);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to connect to stream:', error);
    }
  };

  const handleStopWatching = () => {
    if (market.creator) {
      disconnectFromStreamer(market.creator);
    }
    setIsPlaying(false);
  };

  if (!market.livestream?.isLive) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <div className="text-gray-400 mb-4">
          <Video className="w-12 h-12 mx-auto mb-2" />
          <p>No live stream available</p>
        </div>
        {isStreamer && (
          <button
            onClick={handleStartStream}
            disabled={!address}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            Start Live Stream
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Stream Container */}
      <div className="relative aspect-video bg-black">
        {/* Main Video Stream */}
        {isStreaming ? (
          // Streamer's view
          <div className="relative w-full h-full">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Streamer Controls Overlay */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full ${isMuted ? 'bg-red-600' : 'bg-black/50'} text-white hover:bg-opacity-80 transition-colors`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-black/50'} text-white hover:bg-opacity-80 transition-colors`}
              >
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Stop Stream Button */}
            <button
              onClick={handleStopStream}
              className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Square className="w-4 h-4 inline mr-2" />
              End Stream
            </button>
          </div>
        ) : isPlaying ? (
          // Viewer's view
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Stop Watching Button */}
            <button
              onClick={handleStopWatching}
              className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Stop Watching
            </button>
          </div>
        ) : (
          // Not playing - show play button
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">🔴 LIVE</h3>
                {viewerCount > 0 && (
                  <p className="text-gray-400 text-sm mb-4">
                    {viewerCount} viewer{viewerCount !== 1 ? 's' : ''} watching
                  </p>
                )}
              </div>
              
              {address ? (
                <button
                  onClick={handlePlayStream}
                  disabled={isConnecting}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
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
            </div>
          </div>
        )}
        
        {/* Live Indicator */}
        <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
        
        {/* Viewer Count */}
        {viewerCount > 0 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" />
            {viewerCount}
          </div>
        )}
        
        {/* Error Display */}
        {webrtcError && (
          <div className="absolute bottom-4 left-4 bg-red-600/90 text-white text-sm px-3 py-2 rounded-lg">
            {webrtcError}
          </div>
        )}
      </div>
      
      {/* Stream Info Bar */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {market.creator.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</p>
                <p className="text-xs text-gray-400">Streaming live</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Toggle Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
