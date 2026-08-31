import axios from "axios";

// Mock axios before axiosClient is imported by the store
jest.mock("axios", () => {
  const mockInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
      ...mockInstance,
    },
  };
});

// Mock the auth store so axiosClient module can import it
jest.mock("../store/useAuthStore.js", () => {
  const store = jest.fn(() => ({}));
  store.getState = () => ({ token: null, logout: jest.fn() });
  return { __esModule: true, default: store };
});

let axiosClient;
let useNoteStore;

beforeAll(async () => {
  const axiosMod = await import("../api/axiosClient.js");
  axiosClient = axiosMod.default;
  const storeMod = await import("../store/useNoteStore.js");
  useNoteStore = storeMod.default;
});

describe("useNoteStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNoteStore.setState({
      notes: [],
      currentNote: null,
      loading: false,
      error: null,
    });
  });

  describe("initial state", () => {
    it("has empty notes, no current note, not loading, no error", () => {
      const state = useNoteStore.getState();
      expect(state.notes).toEqual([]);
      expect(state.currentNote).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("setCurrentNote", () => {
    it("sets the current note", () => {
      const note = { id: "1", title: "Test", content: "body" };
      useNoteStore.getState().setCurrentNote(note);
      expect(useNoteStore.getState().currentNote).toEqual(note);
    });
  });

  describe("clearCurrentNote", () => {
    it("clears the current note to null", () => {
      useNoteStore.setState({ currentNote: { id: "1", title: "Test" } });
      useNoteStore.getState().clearCurrentNote();
      expect(useNoteStore.getState().currentNote).toBeNull();
    });
  });

  describe("fetchNotes", () => {
    it("fetches notes and stores them", async () => {
      const mockNotes = [
        { id: "1", title: "Note 1", content: "Content 1" },
        { id: "2", title: "Note 2", content: "Content 2" },
      ];
      axiosClient.get.mockResolvedValueOnce({ data: { data: mockNotes } });

      await useNoteStore.getState().fetchNotes();

      const state = useNoteStore.getState();
      expect(state.notes).toEqual(mockNotes);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(axiosClient.get).toHaveBeenCalledWith("/notes");
    });

    it("sets loading to true while fetching", async () => {
      let resolvePromise;
      axiosClient.get.mockImplementation(
        () => new Promise((resolve) => { resolvePromise = resolve; })
      );

      const fetchPromise = useNoteStore.getState().fetchNotes();

      // Loading should be true during fetch
      expect(useNoteStore.getState().loading).toBe(true);
      expect(useNoteStore.getState().error).toBeNull();

      resolvePromise({ data: { data: [] } });
      await fetchPromise;

      expect(useNoteStore.getState().loading).toBe(false);
    });

    it("sets error message from response on failure", async () => {
      const error = { response: { data: { message: "Unauthorized" } } };
      axiosClient.get.mockRejectedValueOnce(error);

      await expect(useNoteStore.getState().fetchNotes()).rejects.toBe(error);

      const state = useNoteStore.getState();
      expect(state.error).toBe("Unauthorized");
      expect(state.loading).toBe(false);
    });

    it("sets fallback error message when no response message", async () => {
      const error = new Error("Network Error");
      axiosClient.get.mockRejectedValueOnce(error);

      await expect(useNoteStore.getState().fetchNotes()).rejects.toThrow("Network Error");

      expect(useNoteStore.getState().error).toBe("Failed to fetch notes");
    });
  });

  describe("createNote", () => {
    it("creates a note and prepends it to notes array", async () => {
      const existingNote = { id: "1", title: "Old", content: "old" };
      useNoteStore.setState({ notes: [existingNote] });

      const newNote = { id: "2", title: "New Note", content: "new content" };
      axiosClient.post.mockResolvedValueOnce({ data: { data: newNote } });

      const result = await useNoteStore.getState().createNote({ title: "New Note", content: "new content" });

      expect(result).toEqual(newNote);
      const state = useNoteStore.getState();
      expect(state.notes).toEqual([newNote, existingNote]);
      expect(state.loading).toBe(false);
      expect(axiosClient.post).toHaveBeenCalledWith("/notes", { title: "New Note", content: "new content" });
    });

    it("sets error and throws on failure", async () => {
      const error = { response: { data: { message: "Title required" } } };
      axiosClient.post.mockRejectedValueOnce(error);

      await expect(useNoteStore.getState().createNote({ title: "" })).rejects.toBe(error);

      expect(useNoteStore.getState().error).toBe("Title required");
      expect(useNoteStore.getState().loading).toBe(false);
    });

    it("uses fallback error when no response message", async () => {
      axiosClient.post.mockRejectedValueOnce(new Error("Timeout"));

      await expect(
        useNoteStore.getState().createNote({ title: "T" })
      ).rejects.toThrow("Timeout");

      expect(useNoteStore.getState().error).toBe("Failed to create note");
    });
  });

  describe("updateNote", () => {
    it("updates a note in the list and clears currentNote", async () => {
      const original = { id: "1", title: "Old", content: "old" };
      const other = { id: "2", title: "Other", content: "other" };
      useNoteStore.setState({ notes: [original, other], currentNote: original });

      const updated = { id: "1", title: "Updated", content: "updated" };
      axiosClient.put.mockResolvedValueOnce({ data: { data: updated } });

      const result = await useNoteStore.getState().updateNote("1", { title: "Updated", content: "updated" });

      expect(result).toEqual(updated);
      const state = useNoteStore.getState();
      expect(state.notes).toEqual([updated, other]);
      expect(state.currentNote).toBeNull();
      expect(state.loading).toBe(false);
      expect(axiosClient.put).toHaveBeenCalledWith("/notes/1", { title: "Updated", content: "updated" });
    });

    it("sets error and throws on failure", async () => {
      const error = { response: { data: { message: "Not found" } } };
      axiosClient.put.mockRejectedValueOnce(error);

      await expect(
        useNoteStore.getState().updateNote("999", { title: "X" })
      ).rejects.toBe(error);

      expect(useNoteStore.getState().error).toBe("Not found");
      expect(useNoteStore.getState().loading).toBe(false);
    });

    it("uses fallback error when no response message", async () => {
      axiosClient.put.mockRejectedValueOnce(new Error("Server down"));

      await expect(
        useNoteStore.getState().updateNote("1", { title: "X" })
      ).rejects.toThrow("Server down");

      expect(useNoteStore.getState().error).toBe("Failed to update note");
    });
  });

  describe("deleteNote", () => {
    it("removes the note from the list", async () => {
      const notes = [
        { id: "1", title: "Keep", content: "a" },
        { id: "2", title: "Delete Me", content: "b" },
        { id: "3", title: "Also Keep", content: "c" },
      ];
      useNoteStore.setState({ notes });
      axiosClient.delete.mockResolvedValueOnce({});

      await useNoteStore.getState().deleteNote("2");

      const state = useNoteStore.getState();
      expect(state.notes).toEqual([
        { id: "1", title: "Keep", content: "a" },
        { id: "3", title: "Also Keep", content: "c" },
      ]);
      expect(state.loading).toBe(false);
      expect(axiosClient.delete).toHaveBeenCalledWith("/notes/2");
    });

    it("sets error and throws on failure", async () => {
      const error = { response: { data: { message: "Forbidden" } } };
      axiosClient.delete.mockRejectedValueOnce(error);

      await expect(useNoteStore.getState().deleteNote("1")).rejects.toBe(error);

      expect(useNoteStore.getState().error).toBe("Forbidden");
      expect(useNoteStore.getState().loading).toBe(false);
    });

    it("uses fallback error when no response message", async () => {
      axiosClient.delete.mockRejectedValueOnce(new Error("Error"));

      await expect(useNoteStore.getState().deleteNote("1")).rejects.toThrow("Error");

      expect(useNoteStore.getState().error).toBe("Failed to delete note");
    });
  });
});
