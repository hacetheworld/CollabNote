import { useEffect, useRef, useState } from "react";
import { getDocumentById } from "../api/api.service.js";
import { NavLink, useParams } from "react-router-dom";
import Quill from "quill";
import sharedb from "sharedb/lib/client";
import richText from "rich-text";
import { ShareModal } from "../components/shareModal.jsx";
import "quill/dist/quill.snow.css";
import "../styles/editor.css"; // custom CSS
import { useAuth } from "../context/AuthContext.jsx";
import { AppHeader } from "../components/AppHeader.jsx";
import { AppFooter } from "../components/AppFooter.jsx";

sharedb.types.register(richText.type);

export default function EditorPage() {
  const { id } = useParams();
  const editorRef = useRef(null);
  const [permission, setPermission] = useState(null);
  const [title, setTitle] = useState("");
  const quillRef = useRef(null);
  const docRef = useRef(null);
  const [showShare, setShowShare] = useState(false);
  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      const res = await getDocumentById(id);
      setPermission(res.data.permission);
      setTitle(res.data.document.title);
      initEditor(res.data.permission);
    } catch (error) {
      console.error("Failed to load document:", error);
      // Handle error (e.g., redirect or show error message)
    }
  };

  const initEditor = (permission) => {
    const token = localStorage.getItem("accessToken");
    // Ensure the WebSocket connection only runs once and is cleaned up
    if (quillRef.current || docRef.current) return;

    const socket = new WebSocket(`ws://localhost:5000/ws?token=${token}`);
    const connection = new sharedb.Connection(socket);

    const doc = connection.get("documents", id);
    docRef.current = doc;

    doc.subscribe(() => {
      if (!doc.type) {
        // If document doesn't exist, create it with empty content
        return doc.create([{ insert: "" }], "rich-text");
      }

      const toolbarOptions =
        permission !== "viewer"
          ? [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"],
            ]
          : false; // Hide toolbar for viewers

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        readOnly: permission === "viewer",
        modules: {
          toolbar: toolbarOptions,
        },
      });

      quillRef.current = quill;
      quill.setContents(doc.data);

      doc.on("op", (op, source) => {
        if (source) return;
        quill.updateContents(op);
      });

      quill.on("text-change", (delta, oldDelta, source) => {
        if (source !== "user") return;
        if (permission === "viewer") return;
        doc.submitOp(delta, { source: true });
      });
    });

    // Optional: Clean up connection on unmount
    return () => {
      socket.close();
      doc.unsubscribe();
    };
  };

  // Function to handle title changes locally (if user has edit permission)
  const handleTitleChange = (e) => {
    // In a real application, you would also need to save this change to the backend/ShareDB
    setTitle(e.target.value);
  };

  return (
    <div className="editor-page-wrapper">
      <AppHeader />

      <div className="editorShare">
        <input
          className="document-title-input"
          type="text"
          value={title}
          onChange={handleTitleChange}
          disabled={permission === "viewer"}
          placeholder="Untitled Document"
        />

        <button onClick={() => setShowShare(true)}>Share </button>
      </div>
      <div className="quill-container">
        <div ref={editorRef} className="quill-wrapper"></div>
      </div>
      <AppFooter />
      {showShare && (
        <ShareModal docId={id} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
