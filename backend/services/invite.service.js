// services/InviteService.js
import crypto from "crypto";
import Invite from "../models/Invite.model.js";
import DocumentService from "./document.service.js";
import { logger } from "../utils/winstonLogger.js";
import { InvalidInputError } from "../utils/appError.js";

class InviteService {
  // CREATE NEW INVITE
  static async createInvite(
    documentId,
    inviterUserId,
    inviteeEmail,
    permissions,
    cid
  ) {
    logger.info({ message: "Attempting Create Invite.", cid });
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

    const invite = await Invite.create({
      documentId,
      inviterUserId,
      inviteeEmail,
      token,
      expiresAt,
    });
    logger.info({ message: "Successfully Created Invite.", cid });
    // Normally here we send email (mock for now)
    console.log("Invite link:", `/invite/accept/${token}`);

    return invite;
  }

  // ACCEPT INVITE
  static async acceptInvite(token, userId, cid) {
    logger.info({ message: "Attempting accept Invite.", cid });

    const invite = await Invite.findOne({ token });
    if (!invite) throw new InvalidInputError("Invalid invite token");

    // EXPIRED?
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      throw new InvalidInputError("Invite expired");
    }

    // ALREADY USED?
    if (invite.status === "accepted") {
      throw new InvalidInputError("Invite already used");
    }

    // ADD COLLABORATOR TO DOC
    await DocumentService.addCollaborator(
      invite.documentId,
      userId,
      "editor",
      cid
    );

    // MARK AS ACCEPTED
    invite.status = "accepted";
    await invite.save();
    logger.info({ message: "Successfully accepted Invite.", cid });

    return invite;
  }
}

export default InviteService;
