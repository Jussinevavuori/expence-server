import * as z from "zod";
import { conf } from "../conf";
import { User } from "@prisma/client";
import { AbstractToken } from "./AbstractToken";

type IConfirmEmailToken = z.TypeOf<typeof ConfirmEmailToken["schema"]>;

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
  constructor(arg: string | User) {
    super(typeof arg === "string" ? arg : { uid: arg.id }, {
      schema: (_) => _.merge(ConfirmEmailToken.schema),
      tkt: "confirm_email",
      secret: conf.token.confirmEmailToken.secret,
      expiresIn: conf.token.confirmEmailToken.expiresIn,
      defaultUponError: { uid: "" },
    });
    this.uid = this.payload.uid;
  }

  /**
   * Generate a URL for resetting the password
   */
  generateURL() {
    return [conf.hosts.client, "confirmEmail", this.jwt].join("/");
  }

  /**
   * Schema for validating token payloads
   */
  static schema = z.object({ uid: z.string() });
}
