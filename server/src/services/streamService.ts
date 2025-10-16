import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { env } from "../config/env";

export interface LiveKitRoom {
  roomName: string;
  accessToken: string;
  wsUrl: string;
}

export async function createLiveKitRoom(marketId: string, creatorWallet: string): Promise<LiveKitRoom> {
  const apiKey = env.LIVEKIT_API_KEY;
  const apiSecret = env.LIVEKIT_API_SECRET;
  const wsUrl = env.LIVEKIT_URL;
  
  if (!apiKey || !apiSecret) {
    throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured");
  }

  const roomName = `market-${marketId}`;
  
  // Create room service client
  const svc = new RoomServiceClient(wsUrl.replace('ws://', 'http://').replace('wss://', 'https://'), apiKey, apiSecret);
  
  // Create room if it doesn't exist
  try {
    await svc.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 50,
    });
  } catch (err) {
    // Room might already exist, that's okay
    console.log('Room might already exist:', err);
  }

  // Create access token for the creator
  const at = new AccessToken(apiKey, apiSecret, {
    identity: creatorWallet,
  });
  
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const accessToken = await at.toJwt();

  return {
    roomName,
    accessToken,
    wsUrl,
  };
}


