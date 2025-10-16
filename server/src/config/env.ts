import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  MONGO_URI: process.env.MONGO_URI ?? "mongodb+srv://goatfun:Dave#dave5686@cluster0.z4pn6ak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY ?? "",
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET ?? "",
  LIVEKIT_URL: process.env.LIVEKIT_URL ?? "ws://localhost:7880",
};

