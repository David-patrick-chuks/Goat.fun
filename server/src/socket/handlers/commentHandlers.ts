import { Server, Socket } from "socket.io";
import { Comment } from "../../models/Comment";
import { uploadImageFromBuffer } from "../../services/uploadService";
import type { AckResult, ClientEvents, ServerEvents } from "../../types/socket";

export function registerCommentHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  socket.on(
    "add_comment",
    async (
      { marketId, wallet, message, imageData, filename, replyTo }: { 
        marketId: string; 
        wallet: string; 
        message?: string; 
        imageData?: string; 
        filename?: string;
        replyTo?: string;
      },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!message && !imageData) {
          throw new Error("Comment must have either a message or an image");
        }

        // If this is a reply, verify the parent comment exists
        if (replyTo) {
          const parentComment = await Comment.findById(replyTo);
          if (!parentComment || parentComment.marketId !== marketId) {
            throw new Error("Parent comment not found");
          }
        }

        let imageUrl: string | undefined;
        
        // Handle image upload if provided
        if (imageData && filename) {
          const buffer = Buffer.from(imageData.split(',')[1], 'base64');
          const uploadResult = await uploadImageFromBuffer(buffer, filename);
          imageUrl = uploadResult.secure_url;
        }

        // Create comment
        const comment = await Comment.create({
          marketId,
          wallet,
          message: message?.trim(),
          imageUrl,
          replyTo,
          likes: []
        });

        // Broadcast to all users in the market room
        io.to(marketId).emit("comment_added", {
          marketId,
          wallet,
          message: comment.message,
          imageUrl: comment.imageUrl,
          replyTo: comment.replyTo,
          createdAt: comment.createdAt.toISOString()
        });

        ack?.({ ok: true, data: comment });
        console.log(`[socket] add_comment success for marketId: ${marketId}, wallet: ${wallet}, replyTo: ${replyTo || 'none'}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] add_comment error for marketId: ${marketId}, wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "get_comments",
    async (
      { marketId, limit, page }: { marketId: string; limit?: number; page?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const lim = Math.min(50, Math.max(1, limit ?? 20));
        const pg = Math.max(0, page ?? 0);
        const skip = pg * lim;

        const comments = await Comment.find({ marketId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(lim)
          .lean();

        const total = await Comment.countDocuments({ marketId });

        ack?.({ 
          ok: true, 
          data: {
            comments: comments.reverse(), // Show oldest first
            total,
            page: pg,
            limit: lim,
            hasMore: skip + lim < total
          }
        });
        
        console.log(`[socket] get_comments success for marketId: ${marketId}, returned ${comments.length} comments`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_comments error for marketId: ${marketId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "like_comment",
    async (
      { commentId, wallet }: { commentId: string; wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
          throw new Error("Comment not found");
        }

        const isLiked = comment.likes.includes(wallet);
        
        if (isLiked) {
          // Unlike: remove wallet from likes array
          comment.likes = comment.likes.filter(like => like !== wallet);
        } else {
          // Like: add wallet to likes array
          comment.likes.push(wallet);
        }

        await comment.save();

        // Broadcast like/unlike to all users in the market room
        io.to(comment.marketId).emit("comment_liked", {
          commentId,
          wallet,
          isLiked: !isLiked,
          likesCount: comment.likes.length
        });

        ack?.({ ok: true, data: { isLiked: !isLiked, likesCount: comment.likes.length } });
        console.log(`[socket] like_comment success for commentId: ${commentId}, wallet: ${wallet}, isLiked: ${!isLiked}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] like_comment error for commentId: ${commentId}, wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );
}
