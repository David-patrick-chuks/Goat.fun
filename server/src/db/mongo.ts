import mongoose, { ConnectOptions } from "mongoose";
import { env } from "../config/env";

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  };
  await mongoose.connect(env.MONGO_URI, options);
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

