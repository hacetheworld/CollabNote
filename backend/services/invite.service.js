// services/InviteService.js
import crypto from "crypto";
import Invite from "../models/Invite.model.js";
import DocumentService from "./document.service.js";

class InviteService {
  // CREATE NEW INVITE
  static async createInvite(
    documentId,
    inviterUserId,
    inviteeEmail,
    permissions
  ) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

    const invite = await Invite.create({
      documentId,
      inviterUserId,
      inviteeEmail,
      token,
      expiresAt,
    });

    // Normally here we send email (mock for now)
    console.log("Invite link:", `/invite/accept/${token}`);

    return invite;
  }

  // ACCEPT INVITE
  static async acceptInvite(token, userId) {
    const invite = await Invite.findOne({ token });
    if (!invite) throw new Error("Invalid invite token");

    // EXPIRED?
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      throw new Error("Invite expired");
    }

    // ALREADY USED?
    if (invite.status === "accepted") {
      throw new Error("Invite already used");
    }

    // ADD COLLABORATOR TO DOC
    await DocumentService.addCollaborator(invite.documentId, userId, "editor");

    // MARK AS ACCEPTED
    invite.status = "accepted";
    await invite.save();

    return invite;
  }
}

export default InviteService;
