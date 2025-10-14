"use client";

export default function CreateContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Create Your Meme Coin</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#ffea00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Launch Your Meme Coin</h2>
          <p className="text-white/70 mb-6">Create and launch your own meme coin in minutes</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Coin Name"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
            />
            <input 
              type="text" 
              placeholder="Symbol (e.g., DOGE)"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
            />
            <textarea 
              placeholder="Description"
              rows={4}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
            />
            <button className="w-full bg-[#ffea00] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#ffea00] transition-colors">
              Create Coin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
