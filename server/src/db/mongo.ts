import mongoose, { ConnectOptions } from "mongoose";
import { env } from "../config/env";

function sanitizeMongoUri(uri: string): string {
  try {
    if (uri.startsWith("mongodb+srv://")) {
      const protocol = "mongodb+srv://";
      const rest = uri.slice(protocol.length);
      const slashIndex = rest.indexOf("/");
      const hostPart = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
      const pathPart = slashIndex === -1 ? "" : rest.slice(slashIndex);
      const sanitizedHost = hostPart.replace(/:(\d+)$/, "");
      return protocol + sanitizedHost + pathPart;
    }
    return uri;
  } catch {
    return uri;
  }
}

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  };
  const uri = sanitizeMongoUri(env.MONGO_URI);
  await mongoose.connect(uri, options);
  const { host, name } = mongoose.connection;
  console.log(`[db] connected host=${host} db=${name}`);
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

