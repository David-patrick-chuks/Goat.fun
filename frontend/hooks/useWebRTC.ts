"use client";

import React from "react";

export function useWebRTC() {
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);
  const [viewers, setViewers] = React.useState<number>(0);
  const localStreamRef = React.useRef<MediaStream | null>(null);

  const startWebRTCStream = React.useCallback(async () => {
    try {
      console.log('Starting WebRTC stream...');
      
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('Got media stream:', stream);
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      // Simulate viewer count (in a real app, this would come from WebRTC signaling)
      setViewers(1);
      
      console.log('WebRTC stream started successfully');
    } catch (error) {
      console.error('Failed to start WebRTC stream:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Camera/microphone access denied. Please allow camera and microphone access in your browser settings and refresh the page.');
      } else {
        alert(`Failed to start streaming: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, []);

  const stopWebRTCStream = React.useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setViewers(0);
    console.log('WebRTC stream stopped');
  }, []);

  const toggleMute = React.useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleCamera = React.useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isCameraOff;
      });
      setIsCameraOff(!isCameraOff);
    }
  }, [isCameraOff]);

  return {
    localStream,
    isMuted,
    isCameraOff,
    viewers,
    startWebRTCStream,
    stopWebRTCStream,
    toggleMute,
    toggleCamera
  };
}
