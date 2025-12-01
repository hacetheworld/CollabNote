import { useState } from "react";
import { sendInviteApi } from "../api/api.service.js";
// You should ensure this modal CSS is imported in your main app or editor CSS file.
import "../styles/shareModal.css";

export function ShareModal({ docId, onClose }) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const sendInvite = async () => {
    try {
      const res = await sendInviteApi({
        documentId: docId,
        email,
        permission: "editor",
      });
      console.log(res, "invite");
      setInviteLink(res.data.inviteLink);
    } catch (error) {
      console.error("Failed to send invite:", error);
      // Optionally handle error display here
    }
  };

  return (
    // Backdrop class
    <div className="modal-backdrop" onClick={onClose}>
      {/* Modal content class, prevent closing when clicking inside */}
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Share Document</h2>

        {!inviteLink ? (
          <>
            <input
              className="modal-input"
              placeholder="User email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="modal-button modal-button-primary"
              onClick={sendInvite}
            >
              Send Invite
            </button>
          </>
        ) : (
          <>
            <p className="modal-link-label">Invite Link:</p>
            <input className="modal-input" value={inviteLink} readOnly />
            <button
              className="modal-button modal-button-secondary"
              onClick={() => navigator.clipboard.writeText(inviteLink)}
            >
              Copy Link
            </button>
          </>
        )}

        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
