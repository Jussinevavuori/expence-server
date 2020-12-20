import { RequestHandler } from "express";
import * as rateLimit from "express-rate-limit";
import { conf } from "../conf";
import { TooManyRequestsFailure } from "../utils/Failures";

/**
 * Convert minutes to MS
 */
const minutes = (minutes: number) => minutes * 60 * 1000;

const testRateLimiter: RequestHandler = (req, res, next) => next();

const rateLimitExceededHandler: RequestHandler = (req, res, next) => {
  next(new TooManyRequestsFailure());
};

/**
 * Application rate limiters
 */
export const rateLimiter = {
  general() {
    if (process.env.NODE_ENV === "test") {
      return testRateLimiter;
    }
    return rateLimit({
      windowMs: minutes(1),
      max: 500,
      handler: rateLimitExceededHandler,
    });
  },

  strict() {
    if (process.env.NODE_ENV === "test") {
      return testRateLimiter;
    }
    return rateLimit({
      windowMs: minutes(60),
      max: 5,
      handler: rateLimitExceededHandler,
    });
  },
} as const;