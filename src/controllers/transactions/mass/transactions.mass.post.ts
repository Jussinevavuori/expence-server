import { transactionsRouter } from "../..";
import { validateRequestBody } from "../../../utils/validateRequestBody";
import {
  PostTransactionSchema,
  postTransactionSchema,
} from "../../../schemas/transaction.schema";
import { prisma } from "../../../server";
import { v4 as uuid } from "uuid";
import {
  DatabaseAccessFailure,
  InvalidRequestDataFailure,
  UnauthenticatedFailure,
} from "../../../utils/Failures";
import { array, object } from "yup";
import { TransactionService } from "../../../services/TransactionService";

transactionsRouter.post("/mass/post", async (req, res, next) => {
  try {
    // Ensure authenticated
    if (!req.data.auth.user) {
      return next(new UnauthenticatedFailure());
    }

    // Get request body and validate it
    const body = await validateRequestBody<{
      transactions: PostTransactionSchema[];
    }>(
      req,
      object({
        transactions: array().of(postTransactionSchema).defined(),
      }).defined()
    );
    if (body.isFailure()) {
      return next(body);
    }

    // Ensure UIDs are same as authenticated user's if they exist
    const hasInvalidUids = body.value.transactions.some((_) => {
      _.uid && _.uid !== req.data.auth!.user!.id;
    });
    if (hasInvalidUids) {
      return next(
        new InvalidRequestDataFailure({
          uid: "Cannot create transactions for another user id",
        })
      );
    }

    // Generate IDs or use provided IDs
    const transactionsWithIds = body.value.transactions.map((transaction) => {
      return { ...transaction, id: transaction.id || uuid() };
    });

    // Check no transaction already exists with IDs
    const overlappingTransactions = await prisma.transaction.findMany({
      where: {
        id: {
          in: transactionsWithIds.map((_) => _.id),
        },
      },
    });

    // Create lookup object of overlapping IDs for computational efficiency
    const overlappingIds = overlappingTransactions.reduce((ids, _) => {
      return { ...ids, [_.id]: true };
    }, {} as Record<string, boolean>);

	    // Create new transactions from body
    const allCreatedTransactions = await Promise.all(
      transactionsWithIds
        .filter((transaction) => !overlappingIds[transaction.id])
        .map((transaction) => {
          return prisma.transaction.create({
            data: {
              id: transaction.id,
              integerAmount: transaction.integerAmount,
              comment: transaction.comment,
              time: new Date(transaction.time),
              user: {
                connect: {
                  id: req.data!.auth!.user!.id,
                },
              },
              category: {
                connectOrCreate: {
                  where: {
                    unique_uid_value: {
                      uid: req.data!.auth!.user!.id,
                      value: transaction.category,
                    },
                  },
                  create: {
                    value: transaction.category,
                    user: {
                      connect: {
                        id: req.data!.auth!.user!.id,
                      },
                    },
                  },
                },
              },
            },
            include: {
              category: true,
            },
          });
        })
    );

    // Send created transaction to user
    return res
      .status(201)
      .json(TransactionService.compressTransactions(allCreatedTransactions));
  } catch (error) {
    return next(new DatabaseAccessFailure(error));
  }
});
