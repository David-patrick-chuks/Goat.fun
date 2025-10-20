"use client";

import { getSocket } from "@/lib/socket";
import type { Ack } from "@/lib/types";
import { useRouter } from "next/navigation";
import React from "react";

interface Comment {
  _id: string;
  marketId: string;
  wallet: string;
  username?: string;
  message?: string;
  imageUrl?: string;
  replyTo?: string;
  likes: string[];
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
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [showReplies, setShowReplies] = React.useState<Set<string>>(new Set());

  const commentsContainerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleUserClick = (wallet: string, username?: string) => {
    // Navigate to profile page using username if available, otherwise wallet
    const profilePath = username ? `/u/${username}` : `/profile/${wallet}`;
    router.push(profilePath);
  };

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
        setComments(prev => {
          // Check if comment already exists (to avoid duplicates from temp comments)
          const exists = prev.some(c => c._id === comment._id || (c._id.startsWith('temp-') && c.wallet === comment.wallet && c.message === comment.message));
          if (exists) return prev;
          return [comment, ...prev];
        });
        // Auto-scroll to top for new comments
        if (commentsContainerRef.current) {
          commentsContainerRef.current.scrollTop = 0;
        }
      }
    });

    socket.on("comment_liked", (data: { commentId: string; wallet: string; isLiked: boolean; likesCount: number }) => {
      setComments(prev => prev.map(comment => 
        comment._id === data.commentId 
          ? { ...comment, likes: data.isLiked ? [...comment.likes, data.wallet] : comment.likes.filter(w => w !== data.wallet) }
          : comment
      ));
    });

    return () => {
      socket.off("comment_added");
      socket.off("comment_liked");
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

  // Like/unlike comment
  const likeComment = (commentId: string) => {
    if (!address) return;
    if (commentId.startsWith('temp-')) return; // avoid sending invalid ObjectId
    
    const socket = getSocket();
    socket.emit('like_comment', { commentId, wallet: address }, (res: Ack) => {
      if (!res?.ok) {
        console.error('Failed to like comment:', res?.error);
      }
    });
  };

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
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
            filename,
            replyTo: replyingTo || undefined
          }, (res: Ack<Comment>) => {
            setIsSubmitting(false);
            if (res?.ok) {
              setMessage("");
              removeImage();
              setReplyingTo(null);
              // Prefer server-created comment (has real _id)
              if (res.data) {
                setComments(prev => [res.data as any, ...prev]);
              }
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
          message: message.trim() || undefined,
          replyTo: replyingTo || undefined
        }, (res: Ack<Comment>) => {
          setIsSubmitting(false);
          if (res?.ok) {
            setMessage("");
            setReplyingTo(null);
            if (res.data) {
              setComments(prev => [res.data as any, ...prev]);
            }
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
          comments.map((comment) => {
            const replies = comments.filter(c => c.replyTo === comment._id);
            const isLiked = address ? comment.likes.includes(address) : false;
            
            return (
              <div key={comment._id} className="border-b border-white/10 pb-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm">
                    {(comment.username || comment.wallet).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => handleUserClick(comment.wallet, comment.username)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                      >
                        {comment.username || `${comment.wallet.slice(0, 6)}...${comment.wallet.slice(-4)}`}
                      </button>
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
                        className="max-w-full max-h-48 rounded-lg object-contain mb-2"
                      />
                    )}

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => likeComment(comment._id)}
                        disabled={!address}
                        className={`flex items-center gap-1 hover:text-white/80 ${
                          isLiked ? 'text-red-400' : 'text-white/60'
                        }`}
                      >
                        <span>❤️</span>
                        <span>{comment.likes.length}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (comment._id.startsWith('temp-')) return; // cannot reply to unsaved comment
                          setReplyingTo(replyingTo === comment._id ? null : comment._id);
                        }}
                        disabled={!address}
                        className="text-white/60 hover:text-white/80"
                      >
                        Reply
                      </button>
                      
                      {replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="text-white/60 hover:text-white/80"
                        >
                          {showReplies.has(comment._id) ? 'Hide replies' : `Show ${replies.length} replies`}
                        </button>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 ml-4 border-l-2 border-white/20 pl-3">
                        <form onSubmit={submitComment} className="space-y-2">
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Reply to ${comment.username || `${comment.wallet.slice(0, 6)}...`}`}
                            disabled={!address || isSubmitting}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none h-16"
                            maxLength={1000}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 bg-white/10 text-white text-sm rounded hover:bg-white/20"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!address || isSubmitting || !message.trim()}
                              className={`px-3 py-1 text-sm rounded ${
                                address && !isSubmitting && message.trim()
                                  ? 'bg-[#ffea00] text-black hover:bg-[#ffd700]'
                                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              {isSubmitting ? 'Posting...' : 'Reply'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Replies */}
                    {showReplies.has(comment._id) && replies.length > 0 && (
                      <div className="mt-3 ml-4 border-l-2 border-white/20 pl-3 space-y-3">
                        {replies.map((reply) => {
                          const isReplyLiked = address ? reply.likes.includes(address) : false;
                          return (
                            <div key={reply._id} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white text-xs">
                                {(reply.username || reply.wallet).slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <button
                                    onClick={() => handleUserClick(reply.wallet, reply.username)}
                                    className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors cursor-pointer"
                                  >
                                    {reply.username || `${reply.wallet.slice(0, 6)}...${reply.wallet.slice(-4)}`}
                                  </button>
                                  <span className="text-white/40 text-xs">
                                    {formatTime(reply.createdAt)}
                                  </span>
                                </div>
                                
                                {reply.message && (
                                  <p className="text-white/90 text-xs mb-1">{reply.message}</p>
                                )}
                                
                                {reply.imageUrl && (
                                  <img 
                                    src={reply.imageUrl} 
                                    alt="Reply" 
                                    className="max-w-full max-h-32 rounded-lg object-contain mb-1"
                                  />
                                )}

                                <div className="flex items-center gap-3 text-xs">
                                  <button
                                    onClick={() => likeComment(reply._id)}
                                    disabled={!address}
                                    className={`flex items-center gap-1 hover:text-white/80 ${
                                      isReplyLiked ? 'text-red-400' : 'text-white/60'
                                    }`}
                                  >
                                    <span>❤️</span>
                                    <span>{reply.likes.length}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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
