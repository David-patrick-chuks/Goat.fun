"use client";

import { getSocket } from "@/lib/socket";
import type { Ack, BackendMarket } from "@/lib/types";
import { RemoteParticipant, RemoteTrack, Room, RoomEvent, Track, TrackPublication, createLocalTracks, LocalTrack } from 'livekit-client';
import { useSearchParams } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";
import PriceChart from "../market/PriceChart";
import TopHolders from "../market/TopHolders";

export default function MarketDetails() {
  const search = useSearchParams();
  const marketId = search.get("marketId");
  const [market, setMarket] = React.useState<BackendMarket | null>(null);
  const [chat, setChat] = React.useState<{ wallet: string; message: string; at: string }[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [participants, setParticipants] = React.useState<RemoteParticipant[]>([]);
  const [localTracks, setLocalTracks] = React.useState<LocalTrack[]>([]);
  const [holders, setHolders] = React.useState<{ wallet: string; side: 'bullish' | 'fade'; shares: number; price: number; timestamp: Date }[]>([]);
  const [priceHistory, setPriceHistory] = React.useState<{ timestamp: Date; bullishPrice: number; fadePrice: number }[]>([]);
  const { address } = useAccount();
  const videoElementRef = React.useRef<HTMLVideoElement>(null);
  const localVideoElementRef = React.useRef<HTMLVideoElement>(null);
  
    const connectToLiveKit = React.useCallback(async (accessToken: string, wsUrl: string, roomName: string) => {
      try {
        if (room) {
          await room.disconnect();
        }
        
        const newRoom = new Room();
        
        newRoom.on(RoomEvent.Connected, () => {
          console.log('Connected to LiveKit room:', roomName);
        });
  
        newRoom.on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from LiveKit room');
        });
  
        newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          console.log('Participant connected:', participant.identity);
          setParticipants(prev => [...prev, participant]);
        });
  
        newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
          console.log('Participant disconnected:', participant.identity);
          setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
        });
  
        newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => {
          console.log('Track subscribed:', track.kind, 'from', participant.identity);
          if (track.kind === Track.Kind.Video && videoElementRef.current) {
            track.attach(videoElementRef.current);
          }
        });
  
        newRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => {
          console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
          track.detach();
        });
  
        await newRoom.connect(wsUrl, accessToken, { autoSubscribe: true });
        setRoom(newRoom);
  
        // Enable camera and microphone for the streamer
        try {
          const tracks = await createLocalTracks({
            audio: true,
            video: true,
          });
          
          for (const track of tracks) {
            await newRoom.localParticipant.publishTrack(track);
          }
          setLocalTracks(tracks);
          
          // Attach local video to preview element
          const videoTrack = tracks.find(track => track.kind === Track.Kind.Video);
          if (videoTrack && localVideoElementRef.current) {
            videoTrack.attach(localVideoElementRef.current);
          }
          
          console.log('Published local tracks');
        } catch (error) {
          console.error('Failed to publish local tracks:', error);
        }
  
      } catch (error) {
        console.error('Failed to connect to LiveKit room:', error);
      }
    }, [room]);

  React.useEffect(() => {
    if (!marketId) return;
    const socket = getSocket();
    
    const fetchMarketDetails = () => {
      socket.emit("get_market_detail", { marketId }, (res: Ack<BackendMarket>) => {
        if (res?.ok && res.data) {
          setMarket(res.data);
          // Auto-connect if stream is already live
          if (res.data?.livestream?.isLive && res.data?.livestream?.streamKey && res.data?.livestream?.playbackUrl && res.data?.livestream?.roomName) {
            connectToLiveKit(res.data.livestream.streamKey, res.data.livestream.playbackUrl, res.data.livestream.roomName);
            setIsStreaming(true);
          }
        }
      });
    };

    fetchMarketDetails();

    socket.emit('get_chat', { marketId, limit: 100 }, (res: Ack<{ wallet: string; message: string; at: string }[]>) => {
      if (res?.ok && Array.isArray(res.data)) setChat(res.data);
    });

    // Load holders data (mock for now)
    setHolders([
      { wallet: '0x1234...5678', side: 'bullish', shares: 1000, price: 1.2, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { wallet: '0x9876...5432', side: 'fade', shares: 500, price: 0.8, timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { wallet: '0xabcd...efgh', side: 'bullish', shares: 2000, price: 1.1, timestamp: new Date(Date.now() - 1000 * 60 * 90) },
    ]);

    // Load price history (mock for now)
    const mockPriceHistory = [];
    for (let i = 24; i >= 0; i--) {
      mockPriceHistory.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        bullishPrice: 1 + Math.sin(i * 0.1) * 0.3 + Math.random() * 0.1,
        fadePrice: 1 - Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1,
      });
    }
    setPriceHistory(mockPriceHistory);

    socket.on("chat_message", (m: { marketId: string; wallet: string; message: string; at: string }) => {
      if (m.marketId === marketId) setChat((prev) => [...prev, { wallet: m.wallet, message: m.message, at: m.at }]);
    });

    socket.on("stream_update", (data: { marketId: string; isLive: boolean }) => {
      if (data.marketId === marketId) {
        fetchMarketDetails(); // Refresh market to get new stream info
      }
    });

    return () => {
      socket.off("chat_message");
      socket.off("stream_update");
      if (room) {
        room.disconnect();
      }
    };
  }, [marketId, connectToLiveKit, room]);

  const startStreaming = async () => {
    if (!marketId) return;
    if (!address) {
      alert('Please connect your wallet to start streaming');
      return;
    }
    const socket = getSocket();
    socket.emit('start_stream', { marketId }, (res: Ack<{ accessToken: string; wsUrl: string; roomName: string }>) => {
      if (res?.ok && res.data) {
        console.log('Stream started:', res.data);
        setIsStreaming(true);
        connectToLiveKit(res.data.accessToken, res.data.wsUrl, res.data.roomName);
      } else {
        console.error('Failed to start stream:', res?.error);
      }
    });
  };

  const stopStreaming = () => {
    if (!marketId) return;
    const socket = getSocket();
    socket.emit('stop_stream', { marketId }, (res: Ack) => {
      if (res?.ok) {
        console.log('Stream stopped');
        setIsStreaming(false);
        setChat([]); // Purge chat on stop
        if (room) {
          room.disconnect();
          setRoom(null);
        }
        // Stop local tracks
        localTracks.forEach(track => track.stop());
        setLocalTracks([]);
      } else {
        console.error('Failed to stop stream:', res?.error);
      }
    });
  };

  if (!marketId) return null;

  return (
    <div className="px-4 pt-6">
      {market ? (
        <>
          <div className="mb-6 bg-black border border-white/10 rounded-lg p-4 text-white">
            <div className="text-lg font-semibold">{market.title} ({market.ticker})</div>
            <div className="text-white/70 text-sm mt-1">Creator: {market.creator}</div>
            <div className="text-white/70 text-sm mt-1">Pool: {market.poolBalance}</div>
            <div className="text-white/70 text-sm mt-1">Status: {market.status}</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {/* Streaming Section */}
              <div className="bg-black border border-white/10 rounded-lg p-3 flex flex-col">
              <div className="flex justify-between mb-2">
                <div className="text-white/80">LiveKit Stream</div>
                <div className="flex gap-2">
                  {!isStreaming ? (
                    <button 
                      onClick={startStreaming} 
                      className={`px-3 py-1 rounded text-sm border ${
                        address 
                          ? 'bg-green-500/20 text-green-300 border-green-300/30 hover:bg-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed'
                      }`}
                      disabled={!address}
                    >
                      {address ? 'Start Stream' : 'Connect Wallet to Stream'}
                    </button>
                  ) : (
                    <button onClick={stopStreaming} className="px-3 py-1 rounded bg-red-500/20 text-red-300 text-sm border border-red-300/30 hover:bg-red-500/30">
                      Stop Stream
                    </button>
                  )}
                </div>
              </div>
              
              {/* Main video area */}
              <div className="flex-1 rounded bg-black/40 border border-white/10 flex flex-col">
                {isStreaming ? (
                  <>
                    {/* Remote participants video */}
                    <div className="flex-1 relative">
                      <video 
                        ref={videoElementRef}
                        className="w-full h-full rounded" 
                        autoPlay 
                        playsInline
                        muted={false}
                      />
                      {participants.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/60">
                          Waiting for participants...
                        </div>
                      )}
                    </div>
                    
                    {/* Local video preview */}
                    <div className="mt-2 h-32 relative">
                      <div className="text-white/60 text-xs mb-1">Your Camera:</div>
                      <video 
                        ref={localVideoElementRef}
                        className="w-full h-full rounded border border-white/20" 
                        autoPlay 
                        playsInline
                        muted
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/60">
                    Click &quot;Start Stream&quot; to begin streaming
                  </div>
                )}
              </div>
              </div>

              {/* Price Chart */}
              <PriceChart data={priceHistory} />
            </div>
            
            <div className="space-y-4">
              {/* Chat Section */}
              <div className="bg-black border border-white/10 rounded-lg p-3 flex flex-col">
              <div className="text-white mb-2">Public Chat</div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {chat.map((m, i) => (
                  <div key={i} className="text-white/80 text-sm">
                    <span className="text-white/50">{m.wallet.slice(0,6)}..: </span>{m.message}
                  </div>
                ))}
              </div>
                <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim() || !marketId) return;
                  if (!address) {
                    alert('Please connect your wallet to send messages');
                    return;
                  }
                  const socket = getSocket();
                  socket.emit("chat_message", { marketId, wallet: address, message: input }, (res: Ack) => {
                    if (res?.ok) setInput("");
                  });
                }}
                className="mt-2 flex gap-2"
              >
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" 
                  placeholder={address ? "Say something" : "Connect wallet to chat"} 
                  disabled={!address}
                />
                <button 
                  className={`px-3 py-1 rounded text-sm ${address ? 'bg-[#ffea00] text-black' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                  disabled={!address}
                >
                  Send
                </button>
              </form>
              </div>

              {/* Top Holders */}
              <TopHolders holders={holders} />
            </div>
          </div>
        </>
      ) : (
        <div className="text-white/60">Loading market…</div>
      )}
    </div>
  );
}