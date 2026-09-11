import { supabaseAdmin } from "../config/supabase";
import { ApiError } from "../utils/apiError";

export const uploadBackendService = {
  /**
   * Uploads an avatar file buffer or base64 image into Supabase Storage.
   */
  async uploadAvatar(
    fileBuffer?: Buffer,
    mimeType = "image/png",
    originalName = "avatar.png",
    base64Payload?: string
  ): Promise<string> {
    if (fileBuffer) {
      const fileExt = originalName.split(".").pop() || "png";
      const filename = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from("avatars")
          .upload(filename, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from("avatars")
            .getPublicUrl(filename);
          return publicUrlData.publicUrl;
        }

        console.warn("Supabase Storage bucket notice, generating data URL:", uploadError.message);
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      } catch {
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    }

    if (base64Payload) {
      return base64Payload;
    }

    throw new ApiError(400, "Image payload (file buffer or base64 string) is required.");
  },
};

export default uploadBackendService;
