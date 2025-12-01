import InviteService from "../services/invite.service.js";
import { logger } from "../utils/winstonLogger.js";

class InviteController {
  // SEND AN INVITE
  static async sendInvite(req, res, next) {
    try {
      const cid = req.cid;
      const { documentId, email, permissions } = req.body;
      const inviterUserId = req.userId;

      const invite = await InviteService.createInvite(
        documentId,
        inviterUserId,
        email,
        permissions,
        cid
      );
      logger.info({
        message: "User profile fetched and response sent.",
        cid,
      });

      res.status(201).json({
        success: true,
        message: "Invite created successfully",
        inviteLink: `http://localhost:3000/invite/accept/${invite.token}`,
      });
    } catch (error) {
      next(error);
    }
  }

  // ACCEPT INVITE
  static async acceptInvite(req, res, next) {
    try {
      const cid = req.cid;
      const token = req.params.token;
      const userId = req.userId;

      const invite = await InviteService.acceptInvite(token, userId, cid);
      logger.info({
        message: "Accept Invite response sent.",
        cid,
      });
      res.json({
        success: true,
        message: "Invite accepted. You now have access to the document.",
        invite,
      });
    } catch (error) {
      console.log("yesssssssss i ran ", error.message);

      next(error);
    }
  }
}

export default InviteController;
