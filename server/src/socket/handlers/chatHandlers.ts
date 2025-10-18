import { Server, Socket } from "socket.io";
import { Conversation } from "../../models/Conversation";
import { Message, type MessageDoc } from "../../models/Message";
import { User } from "../../models/User";
import { UserFollow } from "../../models/UserFollow";
import { uploadImageFromBuffer } from "../../services/uploadService";
import type { AckResult, ClientEvents, ServerEvents } from "../../types/socket";

export function registerMessagingHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  
  // Create conversation
  socket.on(
    "create_conversation",
    async (
      { participants, type, name, description }: { 
        participants: string[]; 
        type: 'direct' | 'group'; 
        name?: string; 
        description?: string 
      },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!socket.data.wallet) {
          throw new Error("User not authenticated");
        }

        // For direct messages, ensure only 2 participants
        if (type === 'direct' && participants.length !== 2) {
          throw new Error("Direct messages must have exactly 2 participants");
        }

        // Check if direct conversation already exists
        if (type === 'direct') {
          const existing = await Conversation.findOne({
            type: 'direct',
            participants: { $all: participants }
          });
          if (existing) {
            ack?.({ ok: true, data: existing });
            return;
          }
        }

        const conversation = await Conversation.create({
          participants,
          type,
          name,
          description,
          createdBy: socket.data.wallet
        });

        // Join all participants to the conversation room
        participants.forEach(participant => {
          const participantSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.data.wallet === participant);
          if (participantSocket) {
            participantSocket.join((conversation._id as any).toString());
          }
        });

        // Broadcast to all participants
        participants.forEach(participant => {
          const participantSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.data.wallet === participant);
          if (participantSocket) {
            participantSocket.emit("conversation_created", {
              conversation: {
                _id: (conversation._id as any).toString(),
                participants: conversation.participants,
                type: conversation.type,
                name: conversation.name,
                description: conversation.description,
                createdAt: conversation.createdAt.toISOString()
              }
            });
          }
        });

        ack?.({ ok: true, data: conversation });
        console.log(`[socket] create_conversation success for ${type} chat with ${participants.length} participants`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] create_conversation error`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Get conversations
  socket.on(
    "get_conversations",
    async (
      { wallet, limit, page }: { wallet: string; limit?: number; page?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const lim = Math.min(50, Math.max(1, limit ?? 20));
        const pg = Math.max(0, page ?? 0);
        const skip = pg * lim;

        const conversations = await Conversation.find({
          participants: wallet
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean();

        // Populate participant details
        const populatedConversations = await Promise.all(
          conversations.map(async (conv) => {
            const participantDetails = await User.find({
              wallet: { $in: conv.participants }
            }).select('wallet username avatarUrl isOnline lastSeen').lean();

            return {
              ...conv,
              participants: participantDetails.map(p => ({
                wallet: p.wallet,
                username: p.username,
                avatarUrl: p.avatarUrl,
                isOnline: p.isOnline,
                lastSeen: p.lastSeen
              }))
            };
          })
        );

        ack?.({ ok: true, data: populatedConversations });
        console.log(`[socket] get_conversations success for wallet: ${wallet}, returned ${conversations.length} conversations`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_conversations error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Send message
  socket.on(
    "send_message",
    async (
      { conversationId, sender, type, content, imageData, filename, marketId, userId, gifUrl, emoji, replyTo }: {
        conversationId: string;
        sender: string;
        type: 'text' | 'image' | 'market' | 'user' | 'gif' | 'emoji';
        content?: string;
        imageData?: string;
        filename?: string;
        marketId?: string;
        userId?: string;
        gifUrl?: string;
        emoji?: string;
        replyTo?: string;
      },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!socket.data.wallet || socket.data.wallet !== sender) {
          throw new Error("User not authenticated");
        }

        // Verify user is participant in conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(sender)) {
          throw new Error("User not authorized to send messages to this conversation");
        }

        let imageUrl: string | undefined;
        
        // Handle image upload if provided
        if (imageData && filename) {
          const buffer = Buffer.from(imageData.split(',')[1], 'base64');
          const uploadResult = await uploadImageFromBuffer(buffer, filename);
          imageUrl = uploadResult.secure_url;
        }

        // Create message
        const message: MessageDoc = await Message.create({
          conversationId,
          sender,
          type,
          content: content?.trim(),
          imageUrl,
          marketId,
          userId,
          gifUrl,
          emoji,
          replyTo
        });

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content: content || `Sent ${type}`,
            sender,
            timestamp: message.createdAt,
            type
          },
          updatedAt: new Date()
        });

        // Broadcast to all participants in the conversation
        io.to(conversationId).emit("message_sent", {
          conversationId,
          message: {
            _id: message._id.toString(),
            sender: message.sender,
            type: message.type,
            content: message.content,
            imageUrl: message.imageUrl,
            marketId: message.marketId,
            userId: message.userId,
            gifUrl: message.gifUrl,
            emoji: message.emoji,
            replyTo: message.replyTo,
            createdAt: message.createdAt.toISOString()
          }
        });

        ack?.({ ok: true, data: message });
        console.log(`[socket] send_message success for conversation: ${conversationId}, type: ${type}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] send_message error for conversation: ${conversationId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Get messages
  socket.on(
    "get_messages",
    async (
      { conversationId, limit, page }: { conversationId: string; limit?: number; page?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!socket.data.wallet) {
          throw new Error("User not authenticated");
        }

        // Verify user is participant in conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.data.wallet)) {
          throw new Error("User not authorized to view messages in this conversation");
        }

        const lim = Math.min(100, Math.max(1, limit ?? 50));
        const pg = Math.max(0, page ?? 0);
        const skip = pg * lim;

        const messages = await Message.find({ conversationId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(lim)
          .lean();

        ack?.({ 
          ok: true, 
          data: {
            messages: messages.reverse(), // Show oldest first
            hasMore: messages.length === lim
          }
        });
        
        console.log(`[socket] get_messages success for conversation: ${conversationId}, returned ${messages.length} messages`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_messages error for conversation: ${conversationId}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Search users
  socket.on(
    "search_users",
    async (
      { query, limit }: { query: string; limit?: number },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const lim = Math.min(20, Math.max(1, limit ?? 10));
        
        const users = await User.find({
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { wallet: { $regex: query, $options: 'i' } }
          ]
        })
        .select('wallet username avatarUrl bio followers following createdMarkets isOnline lastSeen')
        .limit(lim)
        .lean();

        ack?.({ ok: true, data: users });
        console.log(`[socket] search_users success for query: ${query}, returned ${users.length} users`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] search_users error for query: ${query}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Follow user
  socket.on(
    "follow_user",
    async (
      { follower, following }: { follower: string; following: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!socket.data.wallet || socket.data.wallet !== follower) {
          throw new Error("User not authenticated");
        }

        if (follower === following) {
          throw new Error("Cannot follow yourself");
        }

        await UserFollow.create({ follower, following });

        // Update user's following/followers counts
        await User.updateOne(
          { wallet: follower },
          { $addToSet: { following: { wallet: following } } }
        );
        await User.updateOne(
          { wallet: following },
          { $addToSet: { followers: { wallet: follower } } }
        );

        ack?.({ ok: true });
        console.log(`[socket] follow_user success: ${follower} followed ${following}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] follow_user error: ${follower} -> ${following}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Unfollow user
  socket.on(
    "unfollow_user",
    async (
      { follower, following }: { follower: string; following: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!socket.data.wallet || socket.data.wallet !== follower) {
          throw new Error("User not authenticated");
        }

        await UserFollow.deleteOne({ follower, following });

        // Update user's following/followers counts
        await User.updateOne(
          { wallet: follower },
          { $pull: { following: { wallet: following } } }
        );
        await User.updateOne(
          { wallet: following },
          { $pull: { followers: { wallet: follower } } }
        );

        ack?.({ ok: true });
        console.log(`[socket] unfollow_user success: ${follower} unfollowed ${following}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] unfollow_user error: ${follower} -> ${following}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Get following
  socket.on(
    "get_following",
    async (
      { wallet }: { wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const following = await UserFollow.find({ follower: wallet })
          .populate('following', 'wallet username avatarUrl isOnline lastSeen')
          .lean();

        ack?.({ ok: true, data: following });
        console.log(`[socket] get_following success for wallet: ${wallet}, returned ${following.length} users`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_following error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Get followers
  socket.on(
    "get_followers",
    async (
      { wallet }: { wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const followers = await UserFollow.find({ following: wallet })
          .populate('follower', 'wallet username avatarUrl isOnline lastSeen')
          .lean();

        ack?.({ ok: true, data: followers });
        console.log(`[socket] get_followers success for wallet: ${wallet}, returned ${followers.length} users`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_followers error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Update last seen
  socket.on(
    "update_last_seen",
    async (
      { wallet }: { wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        if (!socket.data.wallet || socket.data.wallet !== wallet) {
          throw new Error("User not authenticated");
        }

        await User.updateOne(
          { wallet },
          { 
            lastSeen: new Date(),
            isOnline: true
          }
        );

        // Broadcast to all users who might be interested
        socket.broadcast.emit("user_last_seen", {
          wallet,
          lastSeen: new Date().toISOString()
        });

        ack?.({ ok: true });
        console.log(`[socket] update_last_seen success for wallet: ${wallet}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] update_last_seen error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  // Handle user going offline
  socket.on('disconnect', async () => {
    if (socket.data.wallet) {
      await User.updateOne(
        { wallet: socket.data.wallet },
        { isOnline: false }
      );

      socket.broadcast.emit("user_online", {
        wallet: socket.data.wallet,
        isOnline: false
      });
    }
  });
}