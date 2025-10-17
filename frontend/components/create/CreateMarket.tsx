"use client";

import { getSocket } from "@/lib/socket";
import { AlertTriangle, ChevronDown, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import NextImage from "next/image";
import React from "react";
import { useAccount } from "wagmi";

export default function CreateMarket() {
  const [showSocials, setShowSocials] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [bannerDragActive, setBannerDragActive] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = React.useState<string | null>(null);
  const [durationHours, setDurationHours] = React.useState<6 | 12 | 24 | 72 | null>(null);
  const [title, setTitle] = React.useState("");
  const [ticker, setTicker] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [socialLink, setSocialLink] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const { address, isConnected } = useAccount();

  // Handle file upload
  const handleFile = (file: File, isBanner = false) => {
    if (isBanner) {
      setBannerFile(file);
      // Create preview URL for banner
      const url = URL.createObjectURL(file);
      setBannerPreviewUrl(url);
    } else {
      setUploadedFile(file);
      // Create preview URL for main upload
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [previewUrl, bannerPreviewUrl]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent, isBanner = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (isBanner) {
        setBannerDragActive(true);
      } else {
        setDragActive(true);
      }
    } else if (e.type === "dragleave") {
      if (isBanner) {
        setBannerDragActive(false);
      } else {
        setDragActive(false);
      }
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, isBanner = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBanner) {
      setBannerDragActive(false);
    } else {
      setDragActive(false);
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], isBanner);
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, isBanner = false) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], isBanner);
    }
  };

  async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    return `data:${file.type};base64,${base64}`;
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Create a New Market</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-black border border-white/10 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-1">Market Details</h2>
            <p className="text-white/60 text-sm mb-6">Choose carefully — these can’t be changed after your market goes live.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Market Title</label>
                <input
                  type="text"
                  placeholder="What’s the prediction?"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-white/50 text-xs mt-2">Example: “Will Elon’s tweet about Nigeria reach 50M views in 6 hours?”</p>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Ticker</label>
                <input
                  type="text"
                  placeholder="Short code (3–6 letters)"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                />
                <p className="text-white/50 text-xs mt-2">Example: ELONNG</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white/70 mb-2">Description <span className="text-white/40">(Optional)</span></label>
              <textarea
                rows={5}
                placeholder="Add a short note or context about your event."
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Social links accordion */}
            <div className="mt-4">
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white/80"
              >
                <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Add Social Links <span className="text-white/40">(Optional)</span></span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSocials ? "rotate-180" : ""}`} />
              </button>
              {showSocials && (
                <div className="mt-3 space-y-2">
                  <p className="text-white/60 text-sm">Share the original post or source link for verification.</p>
                  <input type="url" placeholder="Paste source link (Twitter/X, YouTube, or article URL)" className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" />
                  <input type="url" placeholder="Paste source link (Twitter/X, YouTube, or article URL)" className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]" value={socialLink} onChange={(e) => setSocialLink(e.target.value)} />
                  <p className="text-white/50 text-xs">Example: Twitter/X link, YouTube video, or article URL.</p>
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-1">Duration</h3>
              <p className="text-white/60 text-sm">How long should this market stay open for trading?</p>
              <p className="text-white/60 text-xs mb-3">Once the timer runs out, trading stops and the market resolves automatically.</p>
              <p className="text-white/70 text-sm mb-3">Select Duration:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '⏱️ 6 Hours', hours: 6 as const },
                  { label: '🕐 12 Hours', hours: 12 as const },
                  { label: '🕓 24 Hours', hours: 24 as const },
                  { label: '🕕 3 Days', hours: 72 as const },
                ].map(({ label, hours }) => {
                  const selected = durationHours === hours;
                  return (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setDurationHours(hours)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selected ? 'border-[#ffea00] bg-[#ffea00]/10 text-white' : 'border-white/20 text-white/80 hover:border-white/40'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {durationHours !== null && (
                <p className="text-white/60 text-xs mt-2">Selected: {durationHours === 72 ? '3 days' : `${durationHours} hours`}</p>
              )}
            </div>

            {/* Media uploader */}
            <div 
              className={`mt-6 border-2 border-dashed rounded-lg transition-colors ${
                dragActive 
                  ? 'border-[#ffea00] bg-[#ffea00]/5' 
                  : 'border-white/20 hover:border-white/30'
              }`}
              onDragEnter={(e) => handleDrag(e, false)}
              onDragLeave={(e) => handleDrag(e, false)}
              onDragOver={(e) => handleDrag(e, false)}
              onDrop={(e) => handleDrop(e, false)}
            >
              <div className="px-4 pt-4">
                <h3 className="text-white font-semibold">Upload Market Media</h3>
                <p className="text-white/60 text-sm">Select a video or image to represent your market — or drag & drop it below.</p>
              </div>
              {uploadedFile && previewUrl ? (
                <div className="relative">
                  <div className="aspect-square max-h-96 w-full overflow-hidden rounded-lg">
                    {uploadedFile.type.startsWith('video/') ? (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <NextImage 
                        src={previewUrl} 
                        alt="Upload preview" 
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="bg-black/80 rounded-lg px-3 py-2">
                      <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-white/60 text-xs">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={() => {
                        setUploadedFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }}
                      className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/5 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-[#ffea00]" />
              </div>
              <p className="text-white mb-1">Choose File</p>
              <p className="text-white/60 text-sm mb-4">🖼️ Images: up to 15 MB (.jpg, .gif, .png recommended) • 🎥 Videos: up to 30 MB (.mp4 recommended)</p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileInput(e, false)}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="bg-green-300/20 text-green-300 border border-green-300/30 px-4 py-2 rounded cursor-pointer inline-block"
                  >
                    Choose file
                  </label>
                </div>
              )}
            </div>

            {/* File notes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/70">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>
                  <span className="text-white">File size and type</span>
                </div>
                <ul className="list-disc list-inside text-white/60">
                  <li>🖼️ Images: up to 15 MB (.jpg, .gif, .png recommended)</li>
                  <li>🎥 Videos: up to 30 MB (.mp4 recommended)</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
                  <span className="text-white">Recommended Format</span>
                </div>
                <ul className="list-disc list-inside text-white/60">
                  <li>Image: 1:1 square, at least 1000 × 1000 px</li>
                  <li>Video: 16:9 or 9:16, 1080p+</li>
                </ul>
              </div>
            </div>

            {/* Banner accordion */}
            <div className="mt-6">
              <button
                onClick={() => setShowBanner(!showBanner)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white/80"
              >
                <span>Add Banner <span className="text-white/40">(Optional)</span></span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBanner ? "rotate-180" : ""}`} />
              </button>
              {showBanner && (
                <div className="mt-3">
                  <p className="text-white/70 text-sm mb-3">Upload a wide banner shown at the top of your market page.</p>
                  <p className="text-white/60 text-xs mb-4">Max 5 MB, 3:1 / 1500×500 px • Static or animated (.jpg, .png, .gif)</p>
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg transition-colors ${
                      bannerDragActive 
                        ? 'border-[#ffea00] bg-[#ffea00]/5' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    onDragEnter={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, true)}
                    onDragOver={(e) => handleDrag(e, true)}
                    onDrop={(e) => handleDrop(e, true)}
                  >
                    {bannerFile && bannerPreviewUrl ? (
                      <div className="relative">
                        <div className="aspect-[3/1] w-full overflow-hidden rounded-lg relative">
                          <NextImage 
                            src={bannerPreviewUrl} 
                            alt="Banner preview" 
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <div className="bg-black/80 rounded-lg px-3 py-2">
                            <p className="text-white text-sm font-medium">{bannerFile.name}</p>
                            <p className="text-white/60 text-xs">{(bannerFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button 
                            onClick={() => {
                              setBannerFile(null);
                              if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
                              setBannerPreviewUrl(null);
                            }}
                            className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-10 h-10 mx-auto mb-3 bg-white/5 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#ffea00]" />
                        </div>
                        <p className="text-white mb-1 text-sm">Drop banner image here</p>
                        <p className="text-white/60 text-xs mb-3">or click to select</p>
                        <input
                          type="file"
                          id="banner-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileInput(e, true)}
                        />
                        <label 
                          htmlFor="banner-upload"
                          className="bg-green-300/20 text-green-300 border border-green-300/30 px-3 py-1 rounded text-sm cursor-pointer inline-block"
                        >
                          Choose banner
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4 text-white/70 text-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>⚠️ Note: Market details, duration, and media can only be added now. Once your market is deployed, they cannot be edited or changed later — so review everything carefully before launching!</span>
            </div>

            <div className="mt-6">
              <button
                disabled={!isConnected || submitting || !title || !ticker || !durationHours}
                onClick={async () => {
                  if (!isConnected || !address) return;
                  setSubmitting(true);
                  try {
                    const socket = getSocket();
                    let bannerUrl: string | undefined = undefined;
                    if (bannerFile) {
                      setSubmitting(true);
                      const base64 = await fileToBase64(bannerFile);
                      const res: any = await new Promise((resolve) => {
                        socket.emit('upload_market_media', { data: base64, filename: bannerFile.name, mediaType: 'banner' }, (ack: any) => resolve(ack));
                      });
                      if (res?.ok) bannerUrl = res.data?.url;
                    }
                    let mediaUrl: string | undefined = undefined;
                    if (uploadedFile) {
                      setSubmitting(true);
                      const base64 = await fileToBase64(uploadedFile);
                      const res: any = await new Promise((resolve) => {
                        socket.emit('upload_market_media', { data: base64, filename: uploadedFile.name, mediaType: 'media' }, (ack: any) => resolve(ack));
                      });
                      if (res?.ok) mediaUrl = res.data?.url;
                    }
                    await new Promise<void>((resolve, reject) => {
                      socket.emit(
                        'create_market',
                        {
                          creator: address,
                          title,
                          ticker,
                          description,
                          media: mediaUrl,
                          banner: bannerUrl,
                          socialLinks: socialLink ? [socialLink] : undefined,
                          durationHours: durationHours!,
                        },
                        (res: any) => {
                          if (res?.ok) return resolve();
                          reject(new Error(res?.error || 'Failed to create market'));
                        }
                      );
                    });
                    // Reset form minimal
                    setTitle(""); setTicker(""); setDescription(""); setSocialLink(""); setDurationHours(null);
                    setUploadedFile(null); setPreviewUrl(null); setBannerFile(null); setBannerPreviewUrl(null);
                    alert('Market created');
                  } catch (e: any) {
                    alert(e?.message || 'Error creating market');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="w-full bg-green-300/20 text-green-300 border border-green-300/30 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnected ? (submitting ? 'Creating…' : 'Create market') : 'Login to create market'}
              </button>
            </div>
          </section>
        </div>

        {/* Right: Preview */}
        <aside className="lg:col-span-1">
          <div className="bg-black border border-white/10 rounded-lg p-6 sticky top-20">
            <h3 className="text-white mb-4">Preview</h3>
            <div className="h-64 px-5 text-center bg-white/5 rounded-lg flex items-center justify-center text-white/50 text-sm">
              A preview of how the market will look like
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
