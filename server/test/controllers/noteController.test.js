import { expect } from "chai";
import sinon from "sinon";
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from "../../src/controllers/noteController.js";
import prisma from "../../src/utils/prisma.js";

describe("noteController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { id: "user-1" }, body: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createNote", () => {
    it("should create a note and return 201", async () => {
      req.body = { title: "Test", content: "Content" };
      const mockNote = { id: "note-1", title: "Test", content: "Content", userId: "user-1" };
      sinon.stub(prisma, "note").value({
        create: sinon.stub().resolves(mockNote),
      });

      await createNote(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ success: true, data: mockNote })).to.be.true;
    });

    it("should call next on error", async () => {
      sinon.stub(prisma, "note").value({
        create: sinon.stub().rejects(new Error("DB error")),
      });
      await createNote(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  describe("getNotes", () => {
    it("should return notes with 200", async () => {
      const mockNotes = [{ id: "1", title: "A" }];
      sinon.stub(prisma, "note").value({
        findMany: sinon.stub().resolves(mockNotes),
      });

      await getNotes(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ success: true, data: mockNotes })).to.be.true;
    });

    it("should call next on error", async () => {
      sinon.stub(prisma, "note").value({
        findMany: sinon.stub().rejects(new Error("DB error")),
      });
      await getNotes(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  describe("getNoteById", () => {
    it("should return a note with 200", async () => {
      req.params.id = "note-1";
      const mockNote = { id: "note-1", title: "Test" };
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(mockNote),
      });

      await getNoteById(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ success: true, data: mockNote })).to.be.true;
    });

    it("should call next with 404 when note not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(null),
      });

      await getNoteById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });

  describe("updateNote", () => {
    it("should update and return note with 200", async () => {
      req.params.id = "note-1";
      req.body = { title: "Updated" };
      const existing = { id: "note-1", title: "Old" };
      const updated = { count: 1 };
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(existing),
        updateMany: sinon.stub().resolves(updated),
      });

      await updateNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should call next with 404 when note not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(null),
      });

      await updateNote(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });

  describe("deleteNote", () => {
    it("should delete note and return 200", async () => {
      req.params.id = "note-1";
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves({ id: "note-1" }),
        deleteMany: sinon.stub().resolves({ count: 1 }),
      });

      await deleteNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ success: true })).to.be.true;
    });

    it("should call next with 404 when note not found", async () => {
      req.params.id = "nonexistent";
      sinon.stub(prisma, "note").value({
        findFirst: sinon.stub().resolves(null),
      });

      await deleteNote(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });
});
