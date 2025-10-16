"use client";

import { getSocket } from "@/lib/socket";
import type { Ack, BackendMarket } from "@/lib/types";
import { RemoteParticipant, RemoteTrack, Room, RoomEvent, Track } from 'livekit-client';
import { useSearchParams } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

export default function MarketDetails() {
  const search = useSearchParams();
  const marketId = search.get("marketId");
  const [market, setMarket] = React.useState<any>(null);
  const [chat, setChat] = React.useState<{ wallet: string; message: string; at: string }[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [streamingData, setStreamingData] = React.useState<any>(null);
  const { address } = useAccount();

  React.useEffect(() => {
    if (!marketId) return;
    const socket = getSocket();
    socket.emit("get_market_detail", { marketId }, (res: Ack<BackendMarket>) => {
      if (res?.ok) setMarket(res.data as BackendMarket);
    });
    socket.emit('get_chat', { marketId, limit: 100 }, (res: Ack<any[]>) => {
      if (res?.ok && Array.isArray(res.data)) setChat(res.data as any);
    });
    socket.on("chat_message", (m: any) => {
      if (m.marketId === marketId) setChat((prev) => [...prev, { wallet: m.wallet, message: m.message, at: m.at }]);
    });
  }, [marketId]);

  const startStreaming = async () => {
    if (!marketId || !address) return;
    const socket = getSocket();
    socket.emit('start_stream', { marketId }, (res: any) => {
      if (res?.ok) {
        setStreamingData(res.data);
        setIsStreaming(true);
        connectToLiveKit(res.data);
      }
    });
  };

  const stopStreaming = () => {
    if (!marketId) return;
    const socket = getSocket();
    socket.emit('stop_stream', { marketId }, (res: any) => {
      if (res?.ok) {
        setIsStreaming(false);
        if (room) {
          room.disconnect();
          setRoom(null);
        }
      }
    });
  };

  const connectToLiveKit = async (data: any) => {
    try {
      const newRoom = new Room();
      
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to LiveKit room');
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: any, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Video) {
          const videoElement = document.getElementById('livekit-video') as HTMLVideoElement;
          if (videoElement) {
            track.attach(videoElement);
          }
        }
      });

      await newRoom.connect(data.wsUrl, data.accessToken);
      setRoom(newRoom);
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
    }
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
            <div className="lg:col-span-2 bg-black border border-white/10 rounded-lg aspect-video p-3 flex flex-col">
              <div className="flex justify-between mb-2">
                <div className="text-white/80">LiveKit Stream</div>
                <div className="flex gap-2">
                  {!isStreaming ? (
                    <button onClick={startStreaming} className="px-3 py-1 rounded bg-green-500/20 text-green-300 text-sm border border-green-300/30">
                      Start Stream
                    </button>
                  ) : (
                    <button onClick={stopStreaming} className="px-3 py-1 rounded bg-red-500/20 text-red-300 text-sm border border-red-300/30">
                      Stop Stream
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 rounded bg-black/40 border border-white/10 flex items-center justify-center">
                <video 
                  id="livekit-video" 
                  className="w-full h-full rounded" 
                  autoPlay 
                  playsInline
                  style={{ display: isStreaming ? 'block' : 'none' }}
                />
                {!isStreaming && (
                  <div className="text-white/60">Click "Start Stream" to begin streaming</div>
                )}
              </div>
            </div>
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
                  const socket = getSocket();
                  socket.emit("chat_message", { marketId, wallet: address || 'anon', message: input }, (res: any) => {
                    if (res?.ok) setInput("");
                  });
                }}
                className="mt-2 flex gap-2"
              >
                <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" placeholder="Say something" />
                <button className="px-3 py-1 rounded bg-[#ffea00] text-black text-sm">Send</button>
              </form>
            </div>
          </div></>
      ) : (
        <div className="text-white/60">Loading market…</div>
      )}
    </div>
  );
}