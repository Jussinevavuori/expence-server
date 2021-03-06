import { profileRouter } from "../../routers";
import { prisma } from "../../server";
import { UserService } from "../../lib/users/UserService";
import { UnauthenticatedFailure } from "../../lib/result/Failures";

/**
 * Get the user's profile and other user details.
 */
profileRouter.get("/", async (req, res, next) => {
  /**
   * Require authentication
   */
  const user = req.data.auth.user;
  if (!user) return next(new UnauthenticatedFailure());

  /**
   * Get user's profile
   */
  const profile = await prisma.profile.findUnique({
    where: { uid: user.id },
  });

  /**
   * Respond with data
   */
  const response = await UserService.createResponse(user, profile);
  res.json(response);
});
