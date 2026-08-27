import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("react-quill-new", () => {
  const MockQuill = (props) => (
    <textarea
      data-testid="mock-quill"
      value={props.value || ""}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
    />
  );
  return { __esModule: true, default: MockQuill };
});

jest.mock("react-quill-new/dist/quill.snow.css", () => ({}));

const mockLogout = jest.fn();

jest.mock("../store/useAuthStore.js", () => {
  const store = jest.fn((selector) => {
    const state = {
      user: { id: "user-1", email: "testuser@example.com" },
      token: "mock-token",
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    };
    return selector(state);
  });
  store.getState = () => ({
    user: { id: "user-1", email: "testuser@example.com" },
    token: "mock-token",
    isAuthenticated: true,
    login: jest.fn(),
    register: jest.fn(),
    logout: mockLogout,
  });
  return { __esModule: true, default: store };
});

const mockFetchNotes = jest.fn();
const mockCreateNote = jest.fn();
const mockUpdateNote = jest.fn();
const mockDeleteNote = jest.fn();
const mockSetCurrentNote = jest.fn();
const mockClearCurrentNote = jest.fn();

let mockNoteStoreState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  fetchNotes: mockFetchNotes,
  createNote: mockCreateNote,
  updateNote: mockUpdateNote,
  deleteNote: mockDeleteNote,
  setCurrentNote: mockSetCurrentNote,
  clearCurrentNote: mockClearCurrentNote,
};

jest.mock("../store/useNoteStore.js", () => {
  const store = jest.fn(() => mockNoteStoreState);
  return { __esModule: true, default: store };
});

import Dashboard from "../pages/Dashboard.jsx";

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNoteStoreState = {
      notes: [],
      currentNote: null,
      loading: false,
      error: null,
      fetchNotes: mockFetchNotes,
      createNote: mockCreateNote,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      setCurrentNote: mockSetCurrentNote,
      clearCurrentNote: mockClearCurrentNote,
    };
  });

  it("calls fetchNotes on mount", () => {
    render(<Dashboard />);
    expect(mockFetchNotes).toHaveBeenCalled();
  });

  it.each([
    ["user email in the header", "testuser@example.com"],
    ["Notes brand heading", "Notes"],
    ["Logout button", "Logout"],
  ])("displays %s", (_description, expectedText) => {
    render(<Dashboard />);
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it("calls logout when Logout button is clicked", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("shows loading state when loading with no notes", () => {
    mockNoteStoreState.loading = true;
    mockNoteStoreState.notes = [];
    render(<Dashboard />);
    expect(screen.getByText("Loading your notes...")).toBeInTheDocument();
  });

  it("shows empty state when not loading and no notes", () => {
    mockNoteStoreState.loading = false;
    mockNoteStoreState.notes = [];
    render(<Dashboard />);
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first note to get started.")
    ).toBeInTheDocument();
    expect(screen.getByText("Create First Note")).toBeInTheDocument();
  });

  it("shows error banner when error is set", () => {
    mockNoteStoreState.error = "Failed to fetch notes";
    render(<Dashboard />);
    expect(screen.getByText("Failed to fetch notes")).toBeInTheDocument();
  });

  it("displays note count correctly for multiple notes", () => {
    mockNoteStoreState.notes = [
      { id: "1", title: "Note 1", content: "<p>Content 1</p>", createdAt: "2024-01-01" },
      { id: "2", title: "Note 2", content: "<p>Content 2</p>", createdAt: "2024-01-02" },
    ];
    render(<Dashboard />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("notes")).toBeInTheDocument();
  });

  it("displays note count correctly for single note", () => {
    mockNoteStoreState.notes = [
      { id: "1", title: "Note 1", content: "<p>Content 1</p>", createdAt: "2024-01-01" },
    ];
    render(<Dashboard />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("note")).toBeInTheDocument();
  });

  it("renders note cards with titles and content snippets", () => {
    mockNoteStoreState.notes = [
      { id: "1", title: "My First Note", content: "<p>Hello world</p>", createdAt: "2024-01-01" },
      { id: "2", title: "Second Note", content: "<p>Some content here</p>", createdAt: "2024-01-02" },
    ];
    render(<Dashboard />);
    expect(screen.getByText("My First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  it("calls clearCurrentNote and opens editor when New Note is clicked", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("New Note"));
    expect(mockClearCurrentNote).toHaveBeenCalled();
    expect(screen.getByText("Create Note")).toBeInTheDocument();
  });

  it("calls setCurrentNote and opens editor when Edit is clicked", async () => {
    const testNote = { id: "1", title: "Test Note", content: "<p>Test</p>", createdAt: "2024-01-01" };
    mockNoteStoreState.notes = [testNote];
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("Edit"));
    expect(mockSetCurrentNote).toHaveBeenCalledWith(testNote);
  });

  it("shows delete confirmation when Delete is clicked", async () => {
    mockNoteStoreState.notes = [
      { id: "1", title: "Test Note", content: "<p>Test</p>", createdAt: "2024-01-01" },
    ];
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("Delete"));
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls deleteNote when Confirm is clicked after Delete", async () => {
    mockNoteStoreState.notes = [
      { id: "1", title: "Test Note", content: "<p>Test</p>", createdAt: "2024-01-01" },
    ];
    mockDeleteNote.mockResolvedValueOnce();
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("Delete"));
    await user.click(screen.getByText("Confirm"));
    expect(mockDeleteNote).toHaveBeenCalledWith("1");
  });

  it("hides delete confirmation when Cancel is clicked", async () => {
    mockNoteStoreState.notes = [
      { id: "1", title: "Test Note", content: "<p>Test</p>", createdAt: "2024-01-01" },
    ];
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("Delete"));
    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });

  it("opens editor in create mode when Create First Note is clicked in empty state", async () => {
    mockNoteStoreState.notes = [];
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByText("Create First Note"));
    expect(mockClearCurrentNote).toHaveBeenCalled();
    expect(screen.getByText("Create Note")).toBeInTheDocument();
  });
});
