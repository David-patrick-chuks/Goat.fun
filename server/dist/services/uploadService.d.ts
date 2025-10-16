import type { UploadResult } from "../types/cloudinary";
export declare function uploadAvatarFromBuffer(buffer: Buffer, filename: string): Promise<UploadResult>;
export declare function uploadLocalFile(filePath: string, folder?: string): Promise<UploadResult>;
//# sourceMappingURL=uploadService.d.ts.map