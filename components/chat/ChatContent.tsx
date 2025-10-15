"use client";

export default function ChatContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Community Chat</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#ffea00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Join the Conversation</h2>
          <p className="text-white/70 mb-6">Connect with other meme market enthusiasts and share your thoughts</p>
          <button className="bg-[#ffea00] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#ffea00] transition-colors">
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
}
