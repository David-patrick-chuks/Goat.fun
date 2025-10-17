"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { X, Upload, User, FileText } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentBio: string;
  currentAvatarUrl: string;
  onUpdate: (username: string, bio: string, avatarUrl: string) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentBio,
  currentAvatarUrl,
  onUpdate,
}: EditProfileModalProps) {
  const { address } = useAccount();
  const [username, setUsername] = React.useState(currentUsername);
  const [bio, setBio] = React.useState(currentBio);
  const [avatarUrl, setAvatarUrl] = React.useState(currentAvatarUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUsername(currentUsername);
    setBio(currentBio);
    setAvatarUrl(currentAvatarUrl);
  }, [currentUsername, currentBio, currentAvatarUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !address) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as string;
        const socket = getSocket();
        
        socket.emit(
          "upload_avatar",
          { wallet: address, data, filename: file.name },
          (res: Ack<{ url: string }>) => {
            setIsUploading(false);
            if (res?.ok && res.data) {
              setAvatarUrl(res.data.url);
            } else {
              alert("Failed to upload avatar: " + (res?.error || "Unknown error"));
            }
          }
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      console.error("Upload error:", error);
      alert("Failed to upload avatar");
    }
  };

  const handleSave = async () => {
    if (!address) return;
    
    setIsSaving(true);
    const socket = getSocket();
    
    socket.emit(
      "update_profile",
      { wallet: address, username, bio, avatarUrl },
      (res: Ack) => {
        setIsSaving(false);
        if (res?.ok) {
          onUpdate(username, bio, avatarUrl);
          onClose();
        } else {
          alert("Failed to update profile: " + (res?.error || "Unknown error"));
        }
      }
    );
  };

  const handleClose = () => {
    if (!isSaving && !isUploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={handleClose}
            disabled={isSaving || isUploading}
            className="text-white/60 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-white/60" />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
              {isUploading ? "Uploading..." : "Change Avatar"}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00]"
              maxLength={50}
            />
            <p className="text-white/50 text-xs">{username.length}/50 characters</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <FileText size={16} />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-[#ffea00] resize-none"
              maxLength={200}
            />
            <p className="text-white/50 text-xs">{bio.length}/200 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-white/10">
          <button
            onClick={handleClose}
            disabled={isSaving || isUploading}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isUploading || !username.trim()}
            className="flex-1 px-4 py-2 bg-[#ffea00] hover:bg-[#ffea00]/80 text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
