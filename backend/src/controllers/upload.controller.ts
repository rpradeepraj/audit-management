import { Request, Response, NextFunction } from "express";
import { uploadBackendService } from "../services/upload.service";
import { ApiError } from "../utils/apiError";

export const uploadController = {
  /**
   * POST /api/upload/avatar
   * Handles avatar image upload via Multer (multipart/form-data) or JSON Base64.
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let avatarUrl = "";

      if (req.file) {
        avatarUrl = await uploadBackendService.uploadAvatar(
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname
        );
      } else if (req.body?.image) {
        avatarUrl = await uploadBackendService.uploadAvatar(
          undefined,
          undefined,
          undefined,
          req.body.image
        );
      } else {
        throw new ApiError(400, "Image payload (file or base64 string) is required.");
      }

      res.status(200).json({
        success: true,
        message: "Avatar image uploaded successfully",
        url: avatarUrl,
        avatarUrl: avatarUrl,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default uploadController;
