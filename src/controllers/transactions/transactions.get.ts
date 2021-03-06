import * as compression from "compression";
import { transactionsRouter } from "../../routers";
import { Schemas } from "../../lib/schemas/Schemas";
import { prisma } from "../../server";
import { TransactionMapper } from "../../lib/dataMappers/TransactionMapper";
import {
  DatabaseAccessFailure,
  UnauthenticatedFailure,
} from "../../lib/result/Failures";
import { getQuery } from "../../lib/requests/getQuery";

/**
 * Fetch all transactions the user owns.
 */
transactionsRouter.get("/", compression(), async (req, res, next) => {
  try {
    /**
     * Ensure authentication
     */
    if (!req.data.auth.user) return next(new UnauthenticatedFailure());

    /**
     * Validate query parameters
     */
    const query = getQuery(req, Schemas.Transaction.getQuery);

    /**
     * Get all transactions for user
     */
    const transactions = await prisma.transaction.findMany({
      where: {
        uid: {
          equals: req.data.auth.user.id,
        },
        time: {
          gte: query.after,
          lte: query.before,
        },
        scheduleId: query.scheduleId,
      },
      include: {
        Category: true,
        Schedule: true,
      },
    });

    /**
     * Send transactions to user
     */
    res.json(TransactionMapper.compressTransactions(transactions));
  } catch (error) {
    return next(new DatabaseAccessFailure(error));
  }
});
