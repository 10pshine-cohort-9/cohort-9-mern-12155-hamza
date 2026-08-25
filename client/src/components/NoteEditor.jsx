import React, { useState, useEffect, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const NoteEditor = ({ note, onSave, onCancel, loading }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), content });
  };

  const isEditing = Boolean(note);

  return (
    <div className="note-editor-overlay">
      <form className="note-editor" onSubmit={handleSubmit}>
        <h2 className="note-editor__title">
          {isEditing ? "Edit Note" : "Create Note"}
        </h2>

        <div className="note-editor__field">
          <label className="note-editor__label" htmlFor="note-title">
            Title
          </label>
          <input
            id="note-title"
            className="note-editor__input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            required
            autoFocus
          />
        </div>

        <div className="note-editor__field">
          <label className="note-editor__label">Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Write your note..."
          />
        </div>

        <div className="note-editor__actions">
          <button
            type="button"
            className="note-editor__btn note-editor__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="note-editor__btn note-editor__btn--save"
            disabled={loading || !title.trim()}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;
