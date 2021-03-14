import { transactionsRouter } from "..";
import { validateRequestBody } from "../../utils/validateRequestBody";
import { postTransactionSchema } from "../../schemas/transaction.schema";
import { prisma } from "../../server";
import { v4 as uuid } from "uuid";
import {
  DatabaseAccessFailure,
  InvalidRequestDataFailure,
  TransactionAlreadyExistsFailure,
  UnauthenticatedFailure,
} from "../../utils/Failures";
import { TransactionService } from "../../services/TransactionService";
import { connect } from "http2";

transactionsRouter.post("/", async (req, res, next) => {
  try {
    // Ensure authenticated
    if (!req.data.auth.user) {
      return next(new UnauthenticatedFailure());
    }

    // Validate request body
    const body = await validateRequestBody(req, postTransactionSchema);
    if (body.isFailure()) {
      return next(body);
    }

    // Ensure UID is same as authenticated user's if it exists
    if (body.value.uid && body.value.uid !== req.data.auth.user.id) {
      return next(
        new InvalidRequestDataFailure({
          uid: "Cannot create transaction for another user id",
        })
      );
    }

    // Generate ID or use provided ID
    const id = body.value.id || uuid();

    // Check no transaction already exists with given ID
    const existing = await prisma.transaction.findUnique({
      where: { id: id },
    });
    if (existing) {
      return next(new TransactionAlreadyExistsFailure());
    }

    // Create new transaction from body
    const created = await prisma.transaction.create({
      data: {
        id,
        User: {
          connect: {
            id: req.data.auth.user.id,
          },
        },
        Category: {
          connectOrCreate: {
            where: {
              unique_uid_value: {
                uid: req.data.auth.user.id,
                value: body.value.category,
              },
            },
            create: {
              value: body.value.category,
              User: {
                connect: {
                  id: req.data.auth.user.id,
                },
              },
            },
          },
        },
        integerAmount: body.value.integerAmount,
        comment: body.value.comment,
        time: new Date(body.value.time),
      },
      include: {
        Category: true,
      },
    });

    // Update icon if updated icon given
    if (
      body.value.categoryIcon &&
      body.value.categoryIcon !== created.Category.icon
    ) {
      const updatedCategory = await prisma.category.update({
        where: {
          id: created.Category.id,
        },
        data: {
          icon: body.value.categoryIcon,
        },
      });

      // Short-circuit and send transaction to user with 201 status
      // and updated category
      return res.status(201).json(
        TransactionService.mapTransactionToResponse({
          ...created,
          Category: updatedCategory,
        })
      );
    }

    /**
     * Send created transaction to user with 201 status
     */
    return res
      .status(201)
      .json(TransactionService.mapTransactionToResponse(created));
  } catch (error) {
    return next(new DatabaseAccessFailure(error));
  }
});
