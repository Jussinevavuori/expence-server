import { User, Transaction } from "@prisma/client";
import { prisma } from "../server";
import { Result, Failure, Success } from "./Result";
import { Errors } from "../errors/Errors";

/**
 * Helper function to fetch a transaction for user. Only allows accessing
 * own resources
 *
 * @param user Requesting user
 * @param id   Id of requested transaction
 */
export async function getProtectedTransaction(
  user: User,
  id?: string
): Promise<Result<Transaction>> {
  /**
   * Ensure ID exists
   */
  if (!id) {
    return new Failure(
      Errors.Data.InvalidRequestData({
        _root: "No ID provided as URL parameter",
      })
    );
  }

  /**
   * Get transaction
   */
  const transaction = await prisma.transaction.findOne({ where: { id } });

  /**
   * Ensure transaction exists and is user's
   */
  if (!transaction || transaction.uid !== user.id) {
    return new Failure(Errors.Transaction.NotFound());
  }

  /**
   * Return transaction as success
   */
  return new Success(transaction);
}
