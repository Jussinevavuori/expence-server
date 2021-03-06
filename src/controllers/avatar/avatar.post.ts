import * as express from "express";
import * as multer from "multer";
import { avatarRouter } from "../../routers";
import { rateLimiters } from "../../middleware/rateLimiters";
import { prisma } from "../../server";
import { AvatarService } from "../../lib/avatars/AvatarService";
import { UserService } from "../../lib/users/UserService";
import {
  InvalidRequestDataFailure,
  UnknownFailure,
} from "../../lib/result/Failures";
import { UnauthenticatedFailure } from "../../lib/result/Failures";

/**
 * Memory storage for processing images
 */
const multerMemoryStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Endpoint to post a file and set is as the authenticated user's avatar.
 */
avatarRouter.post(
  "/",
  rateLimiters.strict(),
  multerMemoryStorage.single("file"),
  express.urlencoded({ extended: false }),
  async (req, res, next) => {
    /**
     * Ensure user is authenticated
     */
    const user = req.data.auth.user;
    if (!user) return next(new UnauthenticatedFailure());

    /**
     * Get file from request and ensure one is provided
     */
    const file = req.file;
    if (!file) {
      return next(new InvalidRequestDataFailure({ _file: "No file provided" }));
    }

    /**
     * Upload image to bucket and get its public URL
     */
    const result = await AvatarService.uploadAvatar({ file });
    if (result.isFailure()) return next(result);
    const publicUrl = result.getOr("");
    if (!publicUrl) {
      const msg = `Could not receive public URL for avatar.`;
      return next(new UnknownFailure().withMessage(msg));
    }

    /**
     * Update new photo to user's profile
     */
    const updatedProfile = await prisma.profile.update({
      where: { uid: user.id },
      data: { photoUrl: publicUrl },
    });

    /**
     * Respond with updated auth
     */
    const response = await UserService.createResponse(user, updatedProfile);
    res.json(response);
  }
);
