import { expect } from "chai";
import sinon from "sinon";
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from "../../src/services/noteService.js";
import prisma from "../../src/utils/prisma.js";

describe("noteService", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("createNote", () => {
    it("should successfully create a note", async () => {
      const userId = "user-1";
      const data = { title: "Test Note", content: "Test Content" };
      const mockNote = { id: "note-1", ...data, userId };

      sinon.stub(prisma, "note").value({
        create: sinon.stub().resolves(mockNote)
      });

      let result;
      try {
        result = await createNote(userId, data);
      } catch (error) {
        throw error;
      }

      expect(result).to.deep.equal(mockNote);
      expect(prisma.note.create.calledOnce).to.be.true;
      expect(prisma.note.create.calledWith({
        data: { ...data, userId }
      })).to.be.true;
    });

    it("should propagate error if note creation fails", async () => {
      const error = new Error("Database error");
      sinon.stub(prisma, "note").value({
        create: sinon.stub().rejects(error)
      });

      try {
        await createNote(1, { title: "Test Note" });
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Database error");
      }
    });
  });

  describe("getNotes", () => {
    it("should return an array of notes for a user", async () => {
      const mockNotes = [{ id: "note-1", title: "Note 1", userId: "user-1" }];
      sinon.stub(prisma, "note").value({
        findMany: sinon.stub().resolves(mockNotes)
      });

      let result;
      try {
        result = await getNotes("user-1");
      } catch (error) {
        throw error;
      }

      expect(result).to.deep.equal(mockNotes);
      expect(prisma.note.findMany.calledWith({ where: { userId: "user-1" } })).to.be.true;
    });

    it("should propagate error if fetch fails", async () => {
      const error = new Error("Database error");
      sinon.stub(prisma, "note").value({
        findMany: sinon.stub().rejects(error)
      });

      try {
        await getNotes(1);
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Database error");
      }
    });
  });

  describe("getNoteById", () => {
    it("should return a note by its id for a user", async () => {
      const mockNote = { id: "note-1", title: "Note 1", userId: "user-1" };
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(mockNote)
      });

      let result;
      try {
        result = await getNoteById("user-1", "note-1");
      } catch (error) {
        throw error;
      }

      expect(result).to.deep.equal(mockNote);
      expect(prisma.note.findFirst.calledWith({ where: { id: "note-1", userId: "user-1" } })).to.be.true;
    });

    it("should return null if note is not found", async () => {
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(null)
      });

      let result;
      try {
        result = await getNoteById(1, 999);
      } catch (error) {
        throw error;
      }

      expect(result).to.be.null;
    });
  });

  describe("updateNote", () => {
    it("should update and return the note", async () => {
      const data = { title: "Updated Title" };
      const mockNote = { id: "note-1", title: "Updated Title", userId: "user-1" };
      sinon.stub(prisma, "note").value({
        updateMany: sinon.stub().resolves(mockNote)
      });

      let result;
      try {
        result = await updateNote("user-1", "note-1", data);
      } catch (error) {
        throw error;
      }

      expect(result).to.deep.equal(mockNote);
      expect(prisma.note.updateMany.calledWith({ where: { id: "note-1", userId: "user-1" }, data })).to.be.true;
    });

    it("should propagate error if update fails", async () => {
      const error = new Error("Database error");
      sinon.stub(prisma, "note").value({
        updateMany: sinon.stub().rejects(error)
      });

      try {
        await updateNote(1, 1, { title: "Updated Title" });
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Database error");
      }
    });
  });

  describe("deleteNote", () => {
    it("should delete the note and return it", async () => {
      const mockNote = { id: "note-1", title: "Note 1", userId: "user-1" };
      sinon.stub(prisma, "note").value({
        deleteMany: sinon.stub().resolves(mockNote)
      });

      let result;
      try {
        result = await deleteNote("user-1", "note-1");
      } catch (error) {
        throw error;
      }

      expect(result).to.deep.equal(mockNote);
      expect(prisma.note.deleteMany.calledWith({ where: { id: "note-1", userId: "user-1" } })).to.be.true;
    });

    it("should propagate error if delete fails", async () => {
      const error = new Error("Database error");
      sinon.stub(prisma, "note").value({
        deleteMany: sinon.stub().rejects(error)
      });

      try {
        await deleteNote("user-1", "note-1");
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Database error");
      }
    });
  });
});
