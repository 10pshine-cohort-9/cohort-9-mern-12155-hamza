import React, { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore.js";
import useNoteStore from "../store/useNoteStore.js";
import NoteEditor from "../components/NoteEditor.jsx";
import "./Dashboard.css";

const stripHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    currentNote,
    setCurrentNote,
    clearCurrentNote,
  } = useNoteStore();

  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNew = () => {
    clearCurrentNote();
    setShowEditor(true);
  };

  const handleEdit = (note) => {
    setCurrentNote(note);
    setShowEditor(true);
  };

  const handleCancel = () => {
    clearCurrentNote();
    setShowEditor(false);
  };

  const handleSave = async (data) => {
    try {
      if (currentNote) {
        await updateNote(currentNote.id, data);
      } else {
        await createNote(data);
      }
      setShowEditor(false);
      clearCurrentNote();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <div className="dashboard__logo">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <div>
            <h1 className="dashboard__brand">Notes</h1>
            <p className="dashboard__subtitle">
              {user?.email || "Your Workspace"}
            </p>
          </div>
        </div>
        <button type="button" className="dashboard__logout" onClick={logout}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </header>

      <div className="dashboard__toolbar">
        <div className="dashboard__stats">
          <span className="dashboard__count">{notes.length}</span>
          <span>{notes.length === 1 ? "note" : "notes"}</span>
        </div>
        <button type="button" className="dashboard__create-btn" onClick={handleCreateNew}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Note
        </button>
      </div>

      {error && (
        <div className="dashboard__error">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {loading && notes.length === 0 && (
        <div className="dashboard__loading">
          <div className="dashboard__spinner" />
          <p>Loading your notes...</p>
        </div>
      )}

      {!loading && notes.length === 0 && !error && (
        <div className="dashboard__empty">
          <svg
            className="dashboard__empty-icon"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>No notes yet</h3>
          <p>Create your first note to get started.</p>
          <button type="button" className="dashboard__create-btn" onClick={handleCreateNew}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create First Note
          </button>
        </div>
      )}

      {notes.length > 0 && (
        <div className="dashboard__grid">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-card__header">
                <h3 className="note-card__title">{note.title}</h3>
              </div>
              <p className="note-card__snippet">
                {stripHtml(note.content).substring(0, 150) ||
                  "No content"}
                {stripHtml(note.content).length > 150 ? "..." : ""}
              </p>
              <div className="note-card__actions">
                <button
                  type="button"
                  className="note-card__btn note-card__btn--edit"
                  onClick={() => handleEdit(note)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                {deleteConfirm === note.id ? (
                  <div className="note-card__confirm">
                    <button
                      type="button"
                      className="note-card__btn note-card__btn--confirm-yes"
                      onClick={() => handleDelete(note.id)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="note-card__btn note-card__btn--confirm-no"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="note-card__btn note-card__btn--delete"
                    onClick={() => setDeleteConfirm(note.id)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <NoteEditor
          note={currentNote}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Dashboard;
