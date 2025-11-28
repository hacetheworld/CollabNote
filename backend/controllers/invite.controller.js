import InviteService from "../services/invite.service.js";

class InviteController {
  // SEND AN INVITE
  static async sendInvite(req, res, next) {
    try {
      const { documentId, email, permissions } = req.body;
      const inviterUserId = req.userId;

      const invite = await InviteService.createInvite(
        documentId,
        inviterUserId,
        email,
        permissions
      );

      res.status(201).json({
        success: true,
        message: "Invite created successfully",
        inviteLink: `http://localhost:5173/invite/accept/${invite.token}`,
      });
    } catch (error) {
      next(error);
    }
  }

  // ACCEPT INVITE
  static async acceptInvite(req, res, next) {
    try {
      const token = req.params.token;
      const userId = req.userId;

      const invite = await InviteService.acceptInvite(token, userId);

      res.json({
        success: true,
        message: "Invite accepted. You now have access to the document.",
        invite,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default InviteController;
