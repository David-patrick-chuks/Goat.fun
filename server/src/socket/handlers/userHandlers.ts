import { Server, Socket } from "socket.io";
import { User } from "../../models/User";
import { uploadAvatarFromBuffer } from "../../services/uploadService";
import type { AckResult, ClientEvents, ServerEvents } from "../../types/socket";
import { usernameFromWallet } from "../../utils/user";

export function registerUserHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void {
  socket.on(
    "user_connect",
    async (
      { wallet }: { wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const defaultUsername = usernameFromWallet(wallet);
        await User.updateOne(
          { wallet },
          { 
            $setOnInsert: { 
              createdMarkets: [], 
              createdAt: new Date(),
              username: defaultUsername 
            } 
          },
          { upsert: true }
        );
        ack?.({ ok: true });
        console.log(`[socket] user_connect success for wallet: ${wallet}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] user_connect error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "get_user",
    async (
      { wallet }: { wallet: string },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const user = await User.findOne({ wallet }).lean();
        if (!user) throw new Error("User not found");
        ack?.({ ok: true, data: user });
        console.log(`[socket] get_user success for wallet: ${wallet}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] get_user error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );

  socket.on(
    "update_profile",
    async (
      { wallet, username, bio, avatarBuffer }: { wallet: string; username?: string; bio?: string; avatarBuffer?: Buffer },
      ack?: (result: AckResult) => void
    ) => {
      try {
        const updateData: any = {};
        if (username) updateData.username = username;
        if (bio) updateData.bio = bio;
        if (avatarBuffer) {
          const avatarUrl = await uploadAvatarFromBuffer(avatarBuffer, wallet);
          updateData.avatarUrl = avatarUrl;
        }
        
        await User.updateOne({ wallet }, { $set: updateData });
        ack?.({ ok: true });
        console.log(`[socket] update_profile success for wallet: ${wallet}`);
      } catch (err) {
        const e = err as Error;
        console.error(`[socket] update_profile error for wallet: ${wallet}`, e.message);
        ack?.({ ok: false, error: e.message });
      }
    }
  );
}
