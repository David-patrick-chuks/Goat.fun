"use client";

import { TrendingUp, Users, Video, MessageCircle, Shield, Zap } from "lucide-react";

export default function HowItWorksContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">How It Works</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#ffea00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to GoatFun</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              GoatFun is a decentralized platform where you can trade meme tokens, watch live streams, 
              and connect with the community through real-time chat. Experience the future of meme trading 
              with integrated social features.
            </p>
          </div>

          {/* How It Works Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffea00] rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Create Markets</h3>
              <p className="text-white/70">
                Create prediction markets for meme tokens. Set bullish or fade positions and let the community decide the outcome.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffea00] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Live Stream</h3>
              <p className="text-white/70">
                Stream your market analysis live to the community. Share insights, discuss trends, and build your following.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffea00] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Trade & Chat</h3>
              <p className="text-white/70">
                Trade tokens, participate in live chat discussions, and connect with other traders in real-time.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#ffea00]" />
                  <h4 className="text-lg font-semibold text-white">Meme Token Trading</h4>
                </div>
                <p className="text-white/70">
                  Trade meme tokens with integrated prediction markets. Take bullish or fade positions based on your analysis.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="w-5 h-5 text-[#ffea00]" />
                  <h4 className="text-lg font-semibold text-white">Live Streaming</h4>
                </div>
                <p className="text-white/70">
                  Stream your market analysis and trading strategies live to build your community and share insights.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-[#ffea00]" />
                  <h4 className="text-lg font-semibold text-white">Real-time Chat</h4>
                </div>
                <p className="text-white/70">
                  Engage in live chat during streams, send private messages, and create group conversations with other traders.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-[#ffea00]" />
                  <h4 className="text-lg font-semibold text-white">Decentralized</h4>
                </div>
                <p className="text-white/70">
                  Built on blockchain technology with wallet integration for secure, transparent, and decentralized trading.
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Getting Started</h3>
            <div className="space-y-3 text-white/70">
              <p>1. <strong className="text-white">Connect your wallet</strong> to access all features</p>
              <p>2. <strong className="text-white">Browse markets</strong> or create your own prediction market</p>
              <p>3. <strong className="text-white">Start trading</strong> by taking bullish or fade positions</p>
              <p>4. <strong className="text-white">Join live streams</strong> to learn from experienced traders</p>
              <p>5. <strong className="text-white">Engage in chat</strong> to connect with the community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
