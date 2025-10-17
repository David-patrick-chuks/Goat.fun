"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import React from "react";
import { useAccount } from "wagmi";
import EditProfileModal from "./EditProfileModal";

export default function ProfileContent() {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = React.useState<string>("");
  const [bio, setBio] = React.useState<string>("");
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const [followers, setFollowers] = React.useState<number>(0);
  const [following, setFollowing] = React.useState<number>(0);
  const [createdMarkets, setCreatedMarkets] = React.useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isConnected || !address) return;
    const socket = getSocket();
    socket.emit('get_user', { wallet: address }, (res: Ack<{
      username?: string;
      bio?: string;
      avatarUrl?: string;
      followers?: unknown[];
      following?: unknown[];
      createdMarkets?: unknown[];
    }>) => {
      if (res?.ok && res.data) {
        const u = res.data;
        setUsername(u.username || address.slice(0, 6));
        setBio(u.bio || "");
        setAvatarUrl(u.avatarUrl || "/goatfun.png");
        setFollowers((u.followers || []).length);
        setFollowing((u.following || []).length);
        setCreatedMarkets((u.createdMarkets || []).length);
      }
    });
  }, [isConnected, address]);

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="mb-4">
        <button className="text-white/70 hover:text-white">←</button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 md:w-20 md:h-20 bg-white/10 rounded-full overflow-hidden flex items-center justify-center">
            {/* basic avatar */}
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-semibold text-white">{username || (address ? address.slice(0, 6) : "-")}</h1>
              {address && <span className="bg-white/10 text-white/80 text-[11px] px-2 py-0.5 rounded">{address.slice(0, 6)}...{address.slice(-4)}</span>}
              <a href="#" className="text-white/60 text-xs flex items-center gap-1 hover:text-white">
                <span>View on solscan</span>
              </a>
            </div>
            <p className="text-white/70 text-sm mt-2">{bio}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-[#2f3a4d] hover:bg-[#38475f] text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          edit
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-10 mb-6">
        <div>
          <p className="text-white text-lg font-semibold">{followers}</p>
          <p className="text-white/60 text-sm">Followers</p>
        </div>
        <div>
          <p className="text-white text-lg font-semibold">{following}</p>
          <p className="text-white/60 text-sm">Following</p>
        </div>
        <div>
          <p className="text-white text-lg font-semibold">{createdMarkets}</p>
          <p className="text-white/60 text-sm">Created coins</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 mb-4">
        <div className="flex items-center gap-6 relative">
          <button className="text-white pb-3">Balances</button>
          <button className="text-white/60 pb-3 hover:text-white">Replies</button>
          <button className="text-white/60 pb-3 hover:text-white">Notifications</button>
        </div>
        <div className="h-0.5 w-16 bg-[#5cf894]"></div>
      </div>

      {/* Balances Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-white/60">
            <tr>
              <th className="py-3 pr-4">Coins</th>
              <th className="py-3 pr-4">MCap</th>
              <th className="py-3 pr-4">Value</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            <tr className="border-t border-white/10">
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400" />
                  <div>
                    <div className="text-white">Solana balance</div>
                    <div className="text-white/50 text-[11px]">0.0000 SOL</div>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 text-white/60">—</td>
              <td className="py-4 pr-4 font-semibold">$0</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-10 text-white/50 text-sm flex items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <span>© pump.fun 2025</span>
          <a href="#" className="hover:text-white">Privacy policy</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Terms of service</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Fees</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Revenue</a>
          <span>|</span>
          <a href="#" className="hover:text-white">Tech updates</a>
        </div>
        <a href="#" className="hover:text-white">Report</a>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUsername={username}
        currentBio={bio}
        currentAvatarUrl={avatarUrl}
        onUpdate={(newUsername, newBio, newAvatarUrl) => {
          setUsername(newUsername);
          setBio(newBio);
          setAvatarUrl(newAvatarUrl);
        }}
      />
    </div>
  );
}
