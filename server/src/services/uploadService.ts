import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import path from "path";
import { cloudinary } from "../config/cloudinary";
import type { UploadResult } from "../types/cloudinary";

export async function uploadAvatarFromBuffer(buffer: Buffer, filename: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "goatfun/avatars", resource_type: "image", public_id: path.parse(filename).name },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) return reject(new Error(String(error)));
        resolve({ public_id: result.public_id, secure_url: result.secure_url });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadLocalFile(filePath: string, folder = "goatfun/avatars"): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(filePath, { folder, resource_type: "image" });
  return { public_id: result.public_id, secure_url: result.secure_url };
}

export async function uploadImageFromBuffer(buffer: Buffer, filename: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "goatfun/images", resource_type: "image", public_id: path.parse(filename).name },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) return reject(new Error(String(error)));
        resolve({ public_id: result.public_id, secure_url: result.secure_url });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadMarketMediaFromBuffer(buffer: Buffer, filename: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "goatfun/markets", resource_type: "auto", public_id: path.parse(filename).name },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) return reject(new Error(String(error)));
        resolve({ public_id: result.public_id, secure_url: result.secure_url });
      }
    );
    stream.end(buffer);
  });
}

