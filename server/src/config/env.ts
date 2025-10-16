import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/goatfun",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
};

