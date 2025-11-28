import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["viewer", "editor"], default: "editor" },
});

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    snapshot: { type: String, default: "" },
    collaborators: { type: [collaboratorSchema], default: [] },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
