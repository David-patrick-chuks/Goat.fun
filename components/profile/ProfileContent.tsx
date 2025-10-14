"use client";

export default function ProfileContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#ffea00] rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-black">U</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">User Profile</h2>
          <p className="text-white/70 mb-6">View and manage your meme coin portfolio</p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-[#ffea00] text-2xl font-bold">0</p>
              <p className="text-white/70 text-sm">Coins</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-[#ffea00] text-2xl font-bold">0</p>
              <p className="text-white/70 text-sm">Following</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-[#ffea00] text-2xl font-bold">0</p>
              <p className="text-white/70 text-sm">Followers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
