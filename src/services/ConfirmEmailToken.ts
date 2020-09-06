import * as yup from "yup";
import * as jwt from "jsonwebtoken";
import { conf } from "../conf";
import { User } from "@prisma/client";
import { AbstractToken } from "./AbstractToken";

type IConfirmEmailToken = {
  uid: string;
};

export class ConfirmEmailToken
  extends AbstractToken<IConfirmEmailToken>
  implements IConfirmEmailToken {
  /**
   * Uid of user who the link is for
   */
  readonly uid: string;

  /**
   * Read raw JWT token to generate new auth link token
   */
  constructor(user: User) {
    super(
      { uid: user.id },
      {
        schema: ConfirmEmailToken.schema,
        tkt: "confirm_email",
        secret: conf.token.confirmEmailToken.secret,
        expiresIn: conf.token.confirmEmailToken.expiresIn,
        defaultUponError: { uid: "" },
      }
    );
    this.uid = this.payload.uid;
  }

  /**
   * Schema for validating token payloads
   */
  static schema: yup.ObjectSchema<IConfirmEmailToken> = yup
    .object({
      uid: yup.string().required(),
    })
    .required();
}
