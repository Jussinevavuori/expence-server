import { authRouter } from "..";
import { ForgotPasswordToken } from "../../services/ForgotPasswordToken";
import { prisma } from "../../server";
import { validateRequestBody } from "../../utils/validateRequestBody";
import { passwordOnlyAuthSchema } from "../../schemas/auth.schema";
import { Password } from "../../services/Password";
import { InvalidTokenFailure, UserNotFoundFailure } from "../../utils/Failures";

authRouter.post("/change_password/:token", async (req, res, next) => {
  /**
   * Get and verify token from request
   */
  const jwt = req.params["token"];

  const token = new ForgotPasswordToken(jwt);

  const tokenVerified = await token.verify();

  if (!tokenVerified) {
    return next(new InvalidTokenFailure());
  }

  /**
   * Attempt to get user from token, ensure user has email.
   */
  const user = await prisma.user.findOne({ where: { id: token.uid } });

  if (!user || !user.email || user.disabled) {
    return next(new UserNotFoundFailure());
  }

  /**
   * Get and validate password form
   */
  const body = await validateRequestBody(req, passwordOnlyAuthSchema);

  if (body.isFailure()) {
    return next(body);
  }

  /**
   * Hash password
   */
  const password = await Password.hash(body.value.password);

  /**
   * Update user token version and password
   */
  await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: user.tokenVersion + 1, password },
  });

  /**
   * Send 200 OK upon success
   */
  return res.end();
});
