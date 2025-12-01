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
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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

    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?token=${token}`
    );
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
  const downloadAsPdf = () => {
    // 1. Target the element containing the content (the editor wrapper)
    const input = editorRef.current;

    // Optional: You might want to temporarily hide the Quill toolbar
    // before taking the snapshot if it's visible outside the document area.
    // However, since your wrapper div usually contains the toolbar,
    // you might need a more targeted approach or rely on CSS (see step 3).

    // 2. Use html2canvas to render the element into a Canvas
    html2canvas(input, {
      scale: 2, // Increase scale for higher DPI/resolution in the PDF
      useCORS: true, // Important if your document has external images
      // A crucial setting to handle Quill's fixed/sticky toolbars
      // if you choose to include them:
      ignoreElements: (element) => element.classList.contains("ql-toolbar"),
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // 3. Initialize jsPDF (A4 size, units in millimeters)
      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();

      // Calculate image dimensions to maintain aspect ratio
      const imgProps = doc.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      const contentHeight = pdfWidth / imgRatio;

      let position = 0;

      // 4. Handle Multi-Page Content (Key for long documents)
      if (contentHeight > pdfHeight) {
        // Document is longer than one page, loop through and slice
        let heightLeft = contentHeight;

        doc.addImage(imgData, "PNG", 0, position, pdfWidth, contentHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - contentHeight;
          doc.addPage();
          doc.addImage(imgData, "PNG", 0, position, pdfWidth, contentHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        // Document fits on a single page
        doc.addImage(imgData, "PNG", 0, 0, pdfWidth, contentHeight);
      }

      // 5. Trigger download with the document title
      doc.save(`${title || "Untitled_Document"}.pdf`);
    });
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
        <button onClick={downloadAsPdf} className="download-pdf-button">
          Download PDF
        </button>
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
