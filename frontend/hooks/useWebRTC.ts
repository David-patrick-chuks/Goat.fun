"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { WebRTCOffer, WebRTCAnswer, WebRTCIceCandidate, WebRTCViewerEvent } from "@/lib/types";

interface UseWebRTCProps {
  marketId: string;
  wallet: string;
  isStreamer: boolean;
  isStreaming: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  viewerCount: number;
  startWebRTCStream: () => Promise<void>;
  stopWebRTCStream: () => void;
  connectToStreamer: (streamerWallet: string) => Promise<void>;
  disconnectFromStreamer: (streamerWallet: string) => void;
  isConnecting: boolean;
  error: string | null;
}

export function useWebRTC({ marketId, wallet, isStreamer, isStreaming }: UseWebRTCProps): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socket = getSocket();

  // WebRTC Configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Create peer connection
  const createPeerConnection = useCallback((targetWallet: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[webrtc] Sending ICE candidate to ${targetWallet}`);
        socket.emit('webrtc_ice_candidate', {
          marketId,
          fromWallet: wallet,
          toWallet: targetWallet,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log(`[webrtc] Received remote stream from ${targetWallet}`);
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev).set(targetWallet, remoteStream));
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`[webrtc] Connection state with ${targetWallet}: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'failed') {
        setError(`Connection failed with ${targetWallet}`);
      }
    };

    peerConnections.current.set(targetWallet, peerConnection);
    return peerConnection;
  }, [marketId, wallet, socket]);

  // Start WebRTC stream (for streamer)
  const startWebRTCStream = useCallback(async () => {
    try {
      console.log('[webrtc] Starting WebRTC stream...');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      setLocalStream(stream);
      console.log('[webrtc] WebRTC stream started successfully');
    } catch (err) {
      const error = err as Error;
      console.error('[webrtc] Failed to start WebRTC stream:', error);
      setError(`Failed to start stream: ${error.message}`);
    }
  }, []);

  // Stop WebRTC stream
  const stopWebRTCStream = useCallback(() => {
    console.log('[webrtc] Stopping WebRTC stream...');
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close all peer connections
    peerConnections.current.forEach((peerConnection, targetWallet) => {
      peerConnection.close();
      console.log(`[webrtc] Closed peer connection with ${targetWallet}`);
    });
    peerConnections.current.clear();
    
    // Clear remote streams
    setRemoteStreams(new Map());
    
    console.log('[webrtc] WebRTC stream stopped');
  }, [localStream]);

  // Connect to streamer (for viewers)
  const connectToStreamer = useCallback(async (streamerWallet: string) => {
    try {
      console.log(`[webrtc] Connecting to streamer: ${streamerWallet}`);
      setIsConnecting(true);
      setError(null);
      
      const peerConnection = createPeerConnection(streamerWallet);
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Send offer to streamer
      socket.emit('webrtc_offer', {
        marketId,
        fromWallet: wallet,
        toWallet: streamerWallet,
        offer
      });
      
      console.log(`[webrtc] Offer sent to streamer: ${streamerWallet}`);
      
      // Set a timeout to check if connection was established
      setTimeout(() => {
        if (peerConnection.connectionState === 'connecting') {
          console.log(`[webrtc] Still connecting to ${streamerWallet}...`);
        } else if (peerConnection.connectionState === 'connected') {
          console.log(`[webrtc] Successfully connected to ${streamerWallet}`);
        } else {
          console.log(`[webrtc] Connection state: ${peerConnection.connectionState}`);
        }
      }, 5000);
      
    } catch (err) {
      const error = err as Error;
      console.error(`[webrtc] Failed to connect to streamer: ${streamerWallet}`, error);
      setError(`Failed to connect: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [marketId, wallet, socket, createPeerConnection]);

  // Disconnect from streamer
  const disconnectFromStreamer = useCallback((streamerWallet: string) => {
    console.log(`[webrtc] Disconnecting from streamer: ${streamerWallet}`);
    
    const peerConnection = peerConnections.current.get(streamerWallet);
    if (peerConnection) {
      peerConnection.close();
      peerConnections.current.delete(streamerWallet);
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(streamerWallet);
      return newMap;
    });
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle WebRTC offer (for streamer)
    const handleOffer = async (data: WebRTCOffer) => {
      if (!isStreamer || !localStream) return;
      
      try {
        console.log(`[webrtc] Received offer from ${data.fromWallet}`);
        const peerConnection = createPeerConnection(data.fromWallet);
        
        // Add local stream to peer connection BEFORE setting remote description
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
        
        await peerConnection.setRemoteDescription(data.offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Send answer back
        socket.emit('webrtc_answer', {
          marketId,
          fromWallet: wallet,
          toWallet: data.fromWallet,
          answer
        });
        
        console.log(`[webrtc] Answer sent to ${data.fromWallet}`);
      } catch (err) {
        console.error(`[webrtc] Error handling offer from ${data.fromWallet}:`, err);
      }
    };

    // Handle WebRTC answer (for viewers)
    const handleAnswer = async (data: WebRTCAnswer) => {
      try {
        console.log(`[webrtc] Received answer from ${data.fromWallet}`);
        const peerConnection = peerConnections.current.get(data.fromWallet);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(data.answer);
          console.log(`[webrtc] Answer processed from ${data.fromWallet}`);
        }
      } catch (err) {
        console.error(`[webrtc] Error handling answer from ${data.fromWallet}:`, err);
      }
    };

    // Handle ICE candidates
    const handleIceCandidate = async (data: WebRTCIceCandidate) => {
      try {
        console.log(`[webrtc] Received ICE candidate from ${data.fromWallet}`);
        const peerConnection = peerConnections.current.get(data.fromWallet);
        if (peerConnection) {
          await peerConnection.addIceCandidate(data.candidate);
          console.log(`[webrtc] ICE candidate processed from ${data.fromWallet}`);
        }
      } catch (err) {
        console.error(`[webrtc] Error handling ICE candidate from ${data.fromWallet}:`, err);
      }
    };

    // Handle viewer count updates
    const handleViewerJoined = (data: WebRTCViewerEvent) => {
      console.log(`[webrtc] Viewer joined: ${data.viewerWallet}, total: ${data.viewerCount}`);
      setViewerCount(data.viewerCount);
    };

    const handleViewerLeft = (data: WebRTCViewerEvent) => {
      console.log(`[webrtc] Viewer left: ${data.viewerWallet}, total: ${data.viewerCount}`);
      setViewerCount(data.viewerCount);
    };

    // Register event listeners
    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);
    socket.on('webrtc_viewer_joined', handleViewerJoined);
    socket.on('webrtc_viewer_left', handleViewerLeft);

    // Cleanup
    return () => {
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
      socket.off('webrtc_viewer_joined', handleViewerJoined);
      socket.off('webrtc_viewer_left', handleViewerLeft);
    };
  }, [socket, marketId, wallet, isStreamer, localStream, createPeerConnection]);

  // Join market room when streaming starts
  useEffect(() => {
    if (socket) {
      // Always join the market room (both streamers and viewers)
      socket.emit('webrtc_viewer_join', { marketId, viewerWallet: wallet });
      console.log(`[webrtc] Joined market room: ${marketId} as ${isStreamer ? 'streamer' : 'viewer'}`);
      
      return () => {
        socket.emit('webrtc_viewer_leave', { marketId, viewerWallet: wallet });
        console.log(`[webrtc] Left market room: ${marketId}`);
      };
    }
  }, [marketId, wallet, socket, isStreamer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebRTCStream();
    };
  }, [stopWebRTCStream]);

  return {
    localStream,
    remoteStreams,
    viewerCount,
    startWebRTCStream,
    stopWebRTCStream,
    connectToStreamer,
    disconnectFromStreamer,
    isConnecting,
    error
  };
}