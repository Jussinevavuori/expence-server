import { authRouter } from "..";
import { RefreshToken } from "../../services/RefreshToken";
import { AccessToken } from "../../services/AccessToken";
import {
  InvalidTokenFailure,
  TokenFailure,
  UnauthenticatedFailure,
} from "../../utils/Failures";

authRouter.get("/refresh_token", async (req, res, next) => {
  /**
   * Get refresh token and ensure it exists
   */
  const refreshToken = await RefreshToken.fromRequest(req);

  if (!refreshToken) {
    return next(new UnauthenticatedFailure());
  }

  /**
   * Verify refresh token
   */
  const refreshTokenVerified = await refreshToken.verify();

  if (!refreshTokenVerified) {
    return next(new UnauthenticatedFailure());
  }

  /**
   * Create access token
   */
  const accessToken = new AccessToken(refreshToken);

  if (!accessToken) {
    return next(new TokenFailure());
  }

  /**
   * Verify created access token
   */
  const accessTokenVerified = await accessToken.verify();

  if (!accessTokenVerified) {
    return next(new InvalidTokenFailure());
  }

  /**
   * Send access token as string to user
   */
  return res.send(accessToken.jwt);
});
