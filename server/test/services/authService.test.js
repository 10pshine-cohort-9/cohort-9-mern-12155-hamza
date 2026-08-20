import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "../../src/services/authService.js";
import prisma from "../../src/utils/prisma.js";

describe("authService", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("registerUser", () => {
    it("should successfully register a user", async () => {
      const email = "test@example.com";
      const password = "password123";
      const hashedPassword = "hashedPassword";
      const mockUser = { id: "user-1", email, password: hashedPassword };

      sinon.stub(bcrypt, "hash").resolves(hashedPassword);
      sinon.stub(prisma, "user").value({
        create: sinon.stub().resolves(mockUser)
      });

      let result;
      try {
        result = await registerUser({ email, password });
      } catch (error) {
        throw error;
      }

      expect(result).to.deep.equal(mockUser);
      expect(bcrypt.hash.calledWith(password, 10)).to.be.true;
      expect(prisma.user.create.calledOnce).to.be.true;
      expect(prisma.user.create.calledWith({
        data: { email, password: hashedPassword }
      })).to.be.true;
    });

    it("should throw error if prisma create fails", async () => {
      const error = new Error("Database error");
      sinon.stub(bcrypt, "hash").resolves("hashedPassword");
      sinon.stub(prisma, "user").value({
        create: sinon.stub().rejects(error)
      });

      try {
        await registerUser({ email: "test@example.com", password: "password123" });
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Database error");
      }
    });
  });

  describe("loginUser", () => {
    it("should return null if user is not found", async () => {
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves(null)
      });

      let result;
      try {
        result = await loginUser({ email: "notfound@example.com", password: "password123" });
      } catch (error) {
        throw error;
      }

      expect(result).to.be.null;
    });

    it("should return null if password does not match", async () => {
      const mockUser = { id: "user-1", email: "test@example.com", password: "hashedPassword" };
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves(mockUser)
      });
      sinon.stub(bcrypt, "compare").resolves(false);

      let result;
      try {
        result = await loginUser({ email: "test@example.com", password: "wrongpassword" });
      } catch (error) {
        throw error;
      }

      expect(result).to.be.null;
    });

    it("should return user and token on successful login", async () => {
      const mockUser = { id: "user-1", email: "test@example.com", password: "hashedPassword" };
      const mockToken = "jwt.token.string";
      
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().resolves(mockUser)
      });
      sinon.stub(bcrypt, "compare").resolves(true);
      sinon.stub(jwt, "sign").returns(mockToken);
      
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "secret";

      try {
        const result = await loginUser({ email: "test@example.com", password: "password123" });

        expect(result).to.deep.equal({ user: mockUser, token: mockToken });
        expect(prisma.user.findUnique.calledWith({ where: { email: "test@example.com" } })).to.be.true;
        expect(bcrypt.compare.calledWith("password123", "hashedPassword")).to.be.true;
        expect(jwt.sign.calledWith({ id: mockUser.id }, "secret", { expiresIn: "1d" })).to.be.true;
      } finally {
        if (originalSecret === undefined) {
          delete process.env.JWT_SECRET;
        } else {
          process.env.JWT_SECRET = originalSecret;
        }
      }
    });
    
    it("should propagate database errors", async () => {
      const error = new Error("Database error");
      sinon.stub(prisma, "user").value({
        findUnique: sinon.stub().rejects(error)
      });

      try {
        await loginUser({ email: "test@example.com", password: "password123" });
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Database error");
      }
    });
  });
});
