"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import React from "react";

interface Comment {
  _id: string;
  marketId: string;
  wallet: string;
  message?: string;
  imageUrl?: string;
  createdAt: string;
}

interface CommentsSectionProps {
  marketId: string | null;
  address: string | undefined;
}

export default function CommentsSection({ marketId, address }: CommentsSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);

  const commentsContainerRef = React.useRef<HTMLDivElement>(null);

  // Load comments
  const loadComments = React.useCallback((pageNum = 0, append = false) => {
    if (!marketId) return;
    
    setLoading(true);
    const socket = getSocket();
    
    socket.emit('get_comments', { marketId, limit: 20, page: pageNum }, (res: Ack<{ comments: Comment[]; total: number; page: number; limit: number; hasMore: boolean }>) => {
      setLoading(false);
      if (res?.ok && res.data) {
        if (append) {
          setComments(prev => [...res.data.comments, ...prev]);
        } else {
          setComments(res.data.comments);
        }
        setHasMore(res.data.hasMore);
        setPage(res.data.page);
      }
    });
  }, [marketId]);

  // Load initial comments
  React.useEffect(() => {
    loadComments(0, false);
  }, [loadComments]);

  // Socket event listeners
  React.useEffect(() => {
    if (!marketId) return;
    const socket = getSocket();

    socket.on("comment_added", (comment: Comment) => {
      if (comment.marketId === marketId) {
        setComments(prev => [comment, ...prev]);
        // Auto-scroll to top for new comments
        if (commentsContainerRef.current) {
          commentsContainerRef.current.scrollTop = 0;
        }
      }
    });

    return () => {
      socket.off("comment_added");
    };
  }, [marketId]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Submit comment
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketId || !address || isSubmitting) return;
    if (!message.trim() && !imageFile) return;

    setIsSubmitting(true);
    const socket = getSocket();

    try {
      let imageData: string | undefined;
      let filename: string | undefined;

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          imageData = result;
          filename = imageFile.name;

          socket.emit('add_comment', {
            marketId,
            wallet: address,
            message: message.trim() || undefined,
            imageData,
            filename
          }, (res: Ack) => {
            setIsSubmitting(false);
            if (res?.ok) {
              setMessage("");
              removeImage();
            } else {
              console.error('Failed to add comment:', res?.error);
              alert(`Failed to add comment: ${res?.error}`);
            }
          });
        };
        reader.readAsDataURL(imageFile);
      } else {
        socket.emit('add_comment', {
          marketId,
          wallet: address,
          message: message.trim()
        }, (res: Ack) => {
          setIsSubmitting(false);
          if (res?.ok) {
            setMessage("");
          } else {
            console.error('Failed to add comment:', res?.error);
            alert(`Failed to add comment: ${res?.error}`);
          }
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting comment:', error);
    }
  };

  // Load more comments
  const loadMore = () => {
    if (!loading && hasMore) {
      loadComments(page + 1, true);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-black border border-white/10 rounded-lg p-4">
      <div className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>Comments</span>
        <span className="text-white/60 text-sm">({comments.length})</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={submitComment} className="mb-4">
        <div className="space-y-3">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full max-h-48 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Message Input */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={address ? "Share your thoughts about this market..." : "Connect wallet to comment"}
            disabled={!address || isSubmitting}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none h-20"
            maxLength={1000}
          />

          {/* Image Upload */}
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={!address || isSubmitting}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`px-3 py-2 rounded text-sm cursor-pointer ${
                address && !isSubmitting 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              📷 Image
            </label>
            
            <button
              type="submit"
              disabled={!address || isSubmitting || (!message.trim() && !imageFile)}
              className={`px-4 py-2 rounded text-sm ${
                address && !isSubmitting && (message.trim() || imageFile)
                  ? 'bg-[#ffea00] text-black hover:bg-[#ffd700]'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div 
        ref={commentsContainerRef}
        className="space-y-4 max-h-96 overflow-y-auto"
      >
        {loading && comments.length === 0 ? (
          <div className="text-white/50 text-sm text-center py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-white/50 text-sm text-center py-4">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border-b border-white/10 pb-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm">
                  {comment.wallet.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/80 text-sm font-medium">
                      {comment.wallet.slice(0, 6)}...{comment.wallet.slice(-4)}
                    </span>
                    <span className="text-white/40 text-xs">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  {comment.message && (
                    <p className="text-white/90 text-sm mb-2">{comment.message}</p>
                  )}
                  
                  {comment.imageUrl && (
                    <img 
                      src={comment.imageUrl} 
                      alt="Comment" 
                      className="max-w-full max-h-48 rounded-lg object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-2 text-white/60 text-sm hover:text-white border-t border-white/10"
          >
            {loading ? 'Loading...' : 'Load More Comments'}
          </button>
        )}
      </div>
    </div>
  );
}
