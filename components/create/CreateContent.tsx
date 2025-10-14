"use client";

import { ChevronDown, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import React from "react";

export default function CreateContent() {
  const [showSocials, setShowSocials] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Create new market</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-black border border-white/10 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-1">Market details</h2>
            <p className="text-white/60 text-sm mb-6">Choose carefully, these can&apos;t be changed once the market is created</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Market title</label>
                <input
                  type="text"
                  placeholder="Name your market"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Ticker</label>
                <input
                  type="text"
                  placeholder="Add a ticker (e.g. ELON50M)"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white/70 mb-2">Description <span className="text-white/40">(Optional)</span></label>
              <textarea
                rows={5}
                placeholder="Write a short description"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
              />
            </div>

            {/* Social links accordion */}
            <div className="mt-4">
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white/80"
              >
                <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Add social links <span className="text-white/40">(Optional)</span></span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSocials ? "rotate-180" : ""}`} />
              </button>
              {showSocials && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="url" placeholder="Website URL" className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" />
                  <input type="url" placeholder="Twitter / X URL" className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" />
                  <input type="url" placeholder="Telegram URL" className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" />
                  <input type="url" placeholder="Discord URL" className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" />
                </div>
              )}
            </div>

            {/* Media uploader */}
            <div className="mt-6 border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/5 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-[#ffea00]" />
              </div>
              <p className="text-white mb-1">Select video or image to upload</p>
              <p className="text-white/60 text-sm mb-4">or drag and drop it here</p>
              <button className="bg-green-300/20 text-green-300 border border-green-300/30 px-4 py-2 rounded">Log in</button>
            </div>

            {/* File notes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/70">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>
                  <span className="text-white">File size and type</span>
                </div>
                <ul className="list-disc list-inside text-white/60">
                  <li>Image - max 15mb. .jpg, .gif or .png recommended</li>
                  <li>Video - max 30mb. .mp4 recommended</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
                  <span className="text-white">Resolution and aspect ratio</span>
                </div>
                <ul className="list-disc list-inside text-white/60">
                  <li>Image - min. 1000x1000px, 1:1 square recommended</li>
                  <li>Video - 16:9 or 9:16, 1080p+ recommended</li>
                </ul>
              </div>
            </div>

            {/* Banner accordion */}
            <div className="mt-6">
              <button
                onClick={() => setShowBanner(!showBanner)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white/80"
              >
                <span>Add banner <span className="text-white/40">(Optional)</span></span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBanner ? "rotate-180" : ""}`} />
              </button>
              {showBanner && (
                <div className="mt-3">
                  <input type="url" placeholder="Banner image URL" className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" />
                </div>
              )}
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4 text-white/70 text-sm">
              Market data (social links, banner, etc) can only be added now, and can&apos;t be changed or edited after creation
            </div>

            <div className="mt-6">
              <button className="w-full bg-green-300/20 text-green-300 border border-green-300/30 px-6 py-3 rounded-lg font-semibold">
                Login to create market
              </button>
            </div>
          </section>
        </div>

        {/* Right: Preview */}
        <aside className="lg:col-span-1">
          <div className="bg-black border border-white/10 rounded-lg p-6 sticky top-20">
            <h3 className="text-white mb-4">Preview</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center text-white/50 text-sm">
              A preview of how the market will look like
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
