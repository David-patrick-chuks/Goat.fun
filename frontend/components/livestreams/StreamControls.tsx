"use client";


interface StreamControlsProps {
  localStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onStartStream: () => void;
  onStopStream: () => void;
  isStreaming: boolean;
  isStopping: boolean;
  isStreamer: boolean;
  marketId: string | null;
  address: string | undefined;
}

export default function StreamControls({
  localStream,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onStartStream,
  onStopStream,
  isStreaming,
  isStopping,
  isStreamer,
  marketId,
  address
}: StreamControlsProps) {
  if (!isStreamer) return null;

  return (
    <div className="flex items-center gap-2">
      {!isStreaming ? (
        <button 
          onClick={onStartStream}
          className="px-3 py-1 rounded text-sm bg-green-500/20 text-green-300 border border-green-300/30 hover:bg-green-500/30"
        >
          Start Stream
        </button>
      ) : (
        <button 
          onClick={onStopStream} 
          disabled={isStopping}
          className={`px-3 py-1 rounded text-sm border border-red-300/30 hover:bg-red-500/30 ${
            isStopping 
              ? 'bg-red-500/20 text-red-300 cursor-not-allowed' 
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {isStopping ? 'Stopping...' : 'Stop Stream'}
        </button>
      )}
    </div>
  );
}

export function StreamVideoControls({
  localStream,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera
}: {
  localStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}) {
  if (!localStream) return null;

  return (
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
  );
}
