import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { signup, login } from "../../src/controllers/authController.js";
import prisma from "../../src/utils/prisma.js";

describe("authController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signup", () => {
    it("should return 201 when registration is successful", async () => {
      req.body = { email: "new@example.com", password: "password123" };
      const mockUser = { id: "user-1", email: "new@example.com", password: "hashed" };
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves(null),
        create: sinon.stub().resolves(mockUser),
      });
      sinon.stub(bcrypt, "hash").resolves("hashed");

      await signup(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.data.email).to.equal("new@example.com");
    });

    it("should call next with error for invalid email", async () => {
      req.body = { email: "invalid", password: "password123" };
      await signup(req, res, next);
      expect(next.calledOnce).to.be.true;
      const err = next.firstCall.args[0];
      expect(err).to.be.instanceOf(Error);
    });

    it("should call next with error for short password", async () => {
      req.body = { email: "test@example.com", password: "123" };
      await signup(req, res, next);
      expect(next.calledOnce).to.be.true;
      const err = next.firstCall.args[0];
      expect(err).to.be.instanceOf(Error);
    });

    it("should call next with error if user already exists", async () => {
      req.body = { email: "existing@example.com", password: "password123" };
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves({ id: "user-1", email: "existing@example.com" }),
      });

      await signup(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("User already exists");
    });
  });

  describe("login", () => {
    it("should return 200 with token on successful login", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const mockUser = { id: "user-1", email: "test@example.com", password: "hashed" };
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves(mockUser),
      });
      sinon.stub(bcrypt, "compare").resolves(true);
      sinon.stub(jwt, "sign").returns("jwt-token");

      await login(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response.success).to.be.true;
      expect(response.data.token).to.equal("jwt-token");
    });

    it("should call next with error for invalid credentials", async () => {
      req.body = { email: "test@example.com", password: "wrongpass" };
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves(null),
      });

      await login(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Invalid credentials");
    });

    it("should call next with error for invalid email format", async () => {
      req.body = { email: "bad-email", password: "password123" };
      await login(req, res, next);
      expect(next.calledOnce).to.be.true;
      const err = next.firstCall.args[0];
      expect(err).to.be.instanceOf(Error);
    });
  });
});
