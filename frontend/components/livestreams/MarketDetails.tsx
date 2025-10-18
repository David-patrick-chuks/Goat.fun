"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

// Import components
import CommentsSection from "../market/CommentsSection";
import PriceChart from "../market/PriceChart";
import TopHolders from "../market/TopHolders";
import JoinRequests from "./JoinRequests";
import PublicChat from "./PublicChat";
import StreamControls from "./StreamControls";
import StreamPlayer from "./StreamPlayer";
import TradingSection from "./TradingSection";

// Import hooks
import { useMarketData } from "@/hooks/useMarketData";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function MarketDetails() {
  const search = useSearchParams();
  const marketId = search.get("marketId");
  const { address } = useAccount();

  // State
  const [chat, setChat] = React.useState<{ wallet: string; message: string; at: string }[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isStopping, setIsStopping] = React.useState(false);
  const [joinRequests, setJoinRequests] = React.useState<{ wallet: string; timestamp: Date }[]>([]);
  const [buyAmount, setBuyAmount] = React.useState<string>('');
  const [selectedSide, setSelectedSide] = React.useState<'bullish' | 'fade' | null>(null);
  const [isBuying, setIsBuying] = React.useState(false);

  // Refs
  const videoElementRef = React.useRef<HTMLVideoElement>(null);

  // Get market data first
  const {
    market,
    isStreamer,
    holders,
    setHolders,
    priceHistory,
    setPriceHistory,
    marketCreatorRef
  } = useMarketData(marketId, address);

  // Custom WebRTC hook
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
    marketId: marketId || '',
    wallet: address || '',
    isStreamer: market?.creator === address,
    isStreaming
  });

  // Local state for stream controls
  const [isMuted, setIsMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);

  // Toggle functions for stream controls
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

  // Attach video stream to video element
  React.useEffect(() => {
    if (localStream && videoElementRef.current) {
      videoElementRef.current.srcObject = localStream;
      videoElementRef.current.onloadedmetadata = () => {
        videoElementRef.current?.play().catch(err => {
          console.error('Error playing video:', err);
        });
      };
    }
  }, [localStream]);

  // Socket event handlers
  React.useEffect(() => {
    if (!marketId) return;
    const socket = getSocket();

    // Join market room for chat
    socket.emit('join_market', { marketId }, (res: Ack) => {
      console.log('Joined market room for chat:', res);
    });

    // Load chat history
    socket.emit('get_chat', { marketId, limit: 100 }, (res: Ack<{ wallet: string; message: string; at: string }[]>) => {
      if (res?.ok && Array.isArray(res.data)) {
        setChat(res.data);
        console.log('Loaded chat history:', res.data.length, 'messages');
      }
    });

    // Socket event listeners
    socket.on("chat_message", (m: { marketId: string; wallet: string; message: string; at: string }) => {
      console.log('Received chat message:', m);
      if (m.marketId === marketId) {
        setChat((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.wallet === m.wallet && msg.message === m.message && msg.at === m.at);
          if (exists) return prev;
          return [...prev, { wallet: m.wallet, message: m.message, at: m.at }];
        });
        console.log('Added message to chat:', { wallet: m.wallet, message: m.message, at: m.at });
      }
    });

    socket.on("join_request", (data: { marketId: string; wallet: string }) => {
      if (data.marketId === marketId && marketCreatorRef.current === address) {
        setJoinRequests(prev => [...prev, { wallet: data.wallet, timestamp: new Date() }]);
      }
    });

    socket.on("join_request_accepted", (data: { marketId: string; streamerWallet: string }) => {
      if (data.marketId === marketId && data.streamerWallet === address) {
        console.log('Join request accepted, starting WebRTC connection');
        startWebRTCStream();
      }
    });

    return () => {
      socket.off("chat_message");
      socket.off("join_request");
      socket.off("join_request_accepted");
      // Leave market room
      socket.emit('leave_market', { marketId });
      stopWebRTCStream();
    };
  }, [marketId, address, startWebRTCStream, stopWebRTCStream]);

  // Auto-start stream when market is live and user is streamer
  React.useEffect(() => {
    if (market?.livestream?.isLive && market.creator === address && !isStreaming) {
      console.log('Auto-starting stream for live market');
      startWebRTCStream();
      setIsStreaming(true);
    }
  }, [market?.livestream?.isLive, market?.creator, address, isStreaming, startWebRTCStream]);

  // Stream control functions
  const startStreaming = async () => {
    if (!marketId) return;
    if (!address) {
      alert('Please connect your wallet to start streaming');
      return;
    }
    const socket = getSocket();
    socket.emit('start_stream', { marketId, wallet: address }, (res: Ack<{ streamKey: string; playbackUrl: string; roomName: string }>) => {
      if (res?.ok && res.data) {
        console.log('Stream started:', res.data);
        setIsStreaming(true);
        startWebRTCStream();
      } else {
        console.error('Failed to start stream:', res?.error);
        alert(`Failed to start stream: ${res?.error}`);
      }
    });
  };

  const stopStreaming = async () => {
    if (!marketId) return;
    if (!address) {
      alert('Please connect your wallet to stop streaming');
      return;
    }
    
    setIsStopping(true);
    
    // Stop WebRTC stream immediately for better UX
    console.log('Stopping stream immediately...');
    setIsStreaming(false);
    stopWebRTCStream();
    
    // Then update backend
    const socket = getSocket();
    socket.emit('stop_stream', { marketId, wallet: address }, (res: Ack) => {
      setIsStopping(false);
      if (res?.ok) {
        console.log('Stream stopped on backend');
      } else {
        console.error('Failed to stop stream on backend:', res?.error);
        // If backend fails, we could show a warning but keep the stream stopped locally
        alert(`Warning: Stream stopped locally but failed to update backend: ${res?.error}`);
      }
    });
  };

  const requestToJoin = () => {
    if (!address || !marketId) return;
    const socket = getSocket();
    socket.emit('request_to_join', { marketId, wallet: address }, (res: Ack) => {
      if (res?.ok) {
        console.log('Join request sent');
        alert('Join request sent to streamer!');
      } else {
        console.error('Failed to send join request:', res?.error);
      }
    });
  };

  if (!marketId) {
    return <div className="text-white">No market ID provided</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{market?.title || 'Loading...'}</h1>
              <p className="text-white/70">{market?.ticker || ''}</p>
            </div>
            <StreamControls
              localStream={localStream}
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              onToggleMute={toggleMute}
              onToggleCamera={toggleCamera}
              onStartStream={startStreaming}
              onStopStream={stopStreaming}
              isStreaming={isStreaming}
              isStopping={isStopping}
              isStreamer={isStreamer}
              marketId={marketId}
              address={address}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream Player */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">WebRTC Stream</h2>
              </div>
              <StreamPlayer
                market={market}
                isStreamer={isStreamer}
                isStreaming={isStreaming}
                localStream={localStream}
                viewers={viewerCount}
                videoElementRef={videoElementRef}
                onRequestToJoin={requestToJoin}
                address={address}
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                onToggleMute={toggleMute}
                onToggleCamera={toggleCamera}
                remoteStreams={remoteStreams}
                onConnectToStreamer={connectToStreamer}
                onDisconnectFromStreamer={disconnectFromStreamer}
                isConnecting={isConnecting}
                error={webrtcError}
              />
            </div>

            {/* Trading Section */}
            <TradingSection
              marketId={marketId}
              address={address}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
              selectedSide={selectedSide}
              setSelectedSide={setSelectedSide}
              isBuying={isBuying}
              setIsBuying={setIsBuying}
              holders={holders}
              setHolders={setHolders}
              priceHistory={priceHistory}
              setPriceHistory={setPriceHistory}
            />

            {/* Price Chart */}
            <PriceChart data={priceHistory} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Public Chat */}
            <PublicChat
              chat={chat}
              input={input}
              setInput={setInput}
              marketId={marketId}
              address={address}
              market={market}
            />

            {/* Join Requests (only for streamers) */}
            {isStreamer && (
              <JoinRequests
                joinRequests={joinRequests}
                setJoinRequests={setJoinRequests}
                marketId={marketId}
                address={address}
              />
            )}

            {/* Top Holders */}
            <TopHolders holders={holders} />
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentsSection marketId={marketId} address={address} />
        </div>
      </div>
    </div>
  );
}