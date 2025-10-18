import { Socket, Server as SocketIOServer } from "socket.io";

// Import WebRTC types
interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

// Store active streams and viewers per market
const activeStreams = new Map<string, {
  streamer: string;
  viewers: Set<string>;
  peerConnections: Map<string, any>; // Map of wallet -> peer connection
}>();

export function registerWebRTCHandlers(io: SocketIOServer, socket: Socket) {
  // Reduced logging - only log on first connection per session
  if (!socket.data.webrtcHandlersRegistered) {
    console.log(`[socket] WebRTC handlers registered for socket: ${socket.id}`);
    socket.data.webrtcHandlersRegistered = true;
  }

  // Handle viewer joining a stream
  socket.on(
    "webrtc_viewer_join",
    async (
      { marketId, viewerWallet }: { marketId: string; viewerWallet: string }
    ) => {
      try {
        console.log(`[webrtc] Viewer ${viewerWallet} joining stream for market: ${marketId}`);
        
        // Initialize stream data if not exists
        if (!activeStreams.has(marketId)) {
          activeStreams.set(marketId, {
            streamer: '',
            viewers: new Set(),
            peerConnections: new Map()
          });
        }
        
        const streamData = activeStreams.get(marketId)!;
        streamData.viewers.add(viewerWallet);
        
        // Notify all clients about the new viewer
        io.to(`market-${marketId}`).emit("webrtc_viewer_joined", {
          marketId,
          viewerWallet,
          viewerCount: streamData.viewers.size
        });
        
        console.log(`[webrtc] Viewer ${viewerWallet} joined market ${marketId} (${streamData.viewers.size} total)`);
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error handling viewer join for market: ${marketId}`, e.message);
      }
    }
  );

  // Handle viewer leaving a stream
  socket.on(
    "webrtc_viewer_leave",
    async (
      { marketId, viewerWallet }: { marketId: string; viewerWallet: string }
    ) => {
      try {
        console.log(`[webrtc] Viewer ${viewerWallet} leaving stream for market: ${marketId}`);
        
        const streamData = activeStreams.get(marketId);
        if (streamData) {
          streamData.viewers.delete(viewerWallet);
          streamData.peerConnections.delete(viewerWallet);
          
          // Notify all clients about the viewer leaving
          io.to(`market-${marketId}`).emit("webrtc_viewer_left", {
            marketId,
            viewerWallet,
            viewerCount: streamData.viewers.size
          });
          
          console.log(`[webrtc] Viewer ${viewerWallet} left market ${marketId} (${streamData.viewers.size} total)`);
          
          // Clean up if no viewers left
          if (streamData.viewers.size === 0 && !streamData.streamer) {
            activeStreams.delete(marketId);
            console.log(`[webrtc] Cleaned up stream data for market: ${marketId}`);
          }
        }
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error handling viewer leave for market: ${marketId}`, e.message);
      }
    }
  );

  // Handle WebRTC offer (from viewer to streamer)
  socket.on(
    "webrtc_offer",
    async (
      { marketId, fromWallet, toWallet, offer }: { 
        marketId: string; 
        fromWallet: string; 
        toWallet: string; 
        offer: RTCSessionDescriptionInit 
      }
    ) => {
      try {
        // Forward the offer to the specific target wallet
        // We need to find the socket for the target wallet
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.wallet === toWallet);
        
        console.log(`[webrtc] Looking for target wallet: ${toWallet}`);
        console.log(`[webrtc] Available sockets:`, Array.from(io.sockets.sockets.values()).map(s => ({ id: s.id, wallet: s.data.wallet })));
        
        if (targetSocket) {
          targetSocket.emit("webrtc_offer", {
            marketId,
            fromWallet,
            toWallet,
            offer
          });
          console.log(`[webrtc] Offer: ${fromWallet} → ${toWallet} (${marketId})`);
        } else {
          console.log(`[webrtc] Target wallet ${toWallet} not found for offer from ${fromWallet}`);
        }
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error handling offer for market: ${marketId}`, e.message);
      }
    }
  );

  // Handle WebRTC answer (from streamer to viewer)
  socket.on(
    "webrtc_answer",
    async (
      { marketId, fromWallet, toWallet, answer }: { 
        marketId: string; 
        fromWallet: string; 
        toWallet: string; 
        answer: RTCSessionDescriptionInit 
      }
    ) => {
      try {
        // Forward the answer to the specific target wallet
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.wallet === toWallet);
        
        console.log(`[webrtc] Looking for answer target wallet: ${toWallet}`);
        
        if (targetSocket) {
          targetSocket.emit("webrtc_answer", {
            marketId,
            fromWallet,
            toWallet,
            answer
          });
          console.log(`[webrtc] Answer: ${fromWallet} → ${toWallet} (${marketId})`);
        } else {
          console.log(`[webrtc] Target wallet ${toWallet} not found for answer from ${fromWallet}`);
        }
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error handling answer for market: ${marketId}`, e.message);
      }
    }
  );

  // Handle ICE candidates
  socket.on(
    "webrtc_ice_candidate",
    async (
      { marketId, fromWallet, toWallet, candidate }: { 
        marketId: string; 
        fromWallet: string; 
        toWallet: string; 
        candidate: RTCIceCandidateInit 
      }
    ) => {
      try {
        // Forward the ICE candidate to the target peer
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.wallet === toWallet);
        
        if (targetSocket) {
          targetSocket.emit("webrtc_ice_candidate", {
            marketId,
            fromWallet,
            toWallet,
            candidate
          });
          // Reduced logging for ICE candidates (too verbose)
          // console.log(`[webrtc] ICE: ${fromWallet} → ${toWallet} (${marketId})`);
        } else {
          console.log(`[webrtc] Target wallet ${toWallet} not found for ICE candidate from ${fromWallet}`);
        }
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error handling ICE candidate for market: ${marketId}`, e.message);
      }
    }
  );

  // Handle streamer starting stream
  socket.on(
    "start_stream",
    async (
      { marketId, wallet }: { marketId: string; wallet: string },
      ack?: (result: any) => void
    ) => {
      try {
        console.log(`[webrtc] Streamer ${wallet} starting stream for market: ${marketId}`);
        
        // Initialize or update stream data
        if (!activeStreams.has(marketId)) {
          activeStreams.set(marketId, {
            streamer: wallet,
            viewers: new Set(),
            peerConnections: new Map()
          });
        } else {
          activeStreams.get(marketId)!.streamer = wallet;
        }
        
        console.log(`[webrtc] Stream started by ${wallet} for market: ${marketId}`);
        ack?.({ ok: true });
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error starting stream for market: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Handle streamer stopping stream
  socket.on(
    "stop_stream",
    async (
      { marketId, wallet }: { marketId: string; wallet: string },
      ack?: (result: any) => void
    ) => {
      try {
        console.log(`[webrtc] Streamer ${wallet} stopping stream for market: ${marketId}`);
        
        const streamData = activeStreams.get(marketId);
        if (streamData && streamData.streamer === wallet) {
          // Clean up all peer connections
          streamData.peerConnections.forEach((peerConnection, viewerWallet) => {
            try {
              peerConnection.close();
            } catch (err) {
              console.error(`[webrtc] Error closing peer connection for viewer: ${viewerWallet}`);
            }
          });
          
          // Clear stream data
          activeStreams.delete(marketId);
          console.log(`[webrtc] Stream stopped and cleaned up for market: ${marketId}`);
        }
        
        ack?.({ ok: true });
      } catch (err) {
        const e = err as Error;
        console.error(`[webrtc] Error stopping stream for market: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Clean up on disconnect
  socket.on("disconnect", () => {
    console.log(`[webrtc] Socket ${socket.id} disconnected, cleaning up...`);
    
    // Find and clean up any streams this socket was part of
    activeStreams.forEach((streamData, marketId) => {
      if (streamData.streamer === socket.id || streamData.viewers.has(socket.id)) {
        streamData.viewers.delete(socket.id);
        streamData.peerConnections.delete(socket.id);
        
        if (streamData.viewers.size === 0 && !streamData.streamer) {
          activeStreams.delete(marketId);
        }
      }
    });
  });
}
