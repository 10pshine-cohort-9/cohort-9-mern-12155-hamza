import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import { protect } from "../../src/middleware/authMiddleware.js";
import AppError from "../../src/utils/AppError.js";

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, ip: "127.0.0.1" };
    res = {};
    next = sinon.stub();
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call next with AppError when no authorization header is provided", async () => {
    await protect(req, res, next);
    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal("Not authorized to access this route");
  });

  it("should call next with AppError when authorization header does not start with Bearer", async () => {
    req.headers.authorization = "Basic some-token";
    await protect(req, res, next);
    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(401);
  });

  it("should set req.user and call next when token is valid", async () => {
    const token = jwt.sign({ id: "user-123" }, "test-secret");
    req.headers.authorization = `Bearer ${token}`;
    await protect(req, res, next);
    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args).to.have.lengthOf(0);
    expect(req.user).to.deep.equal({ id: "user-123" });
  });

  it("should call next with AppError when token is invalid", async () => {
    req.headers.authorization = "Bearer invalid.token.here";
    await protect(req, res, next);
    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(401);
  });

  it("should call next with AppError when token is expired", async () => {
    const token = jwt.sign({ id: "user-123" }, "test-secret", { expiresIn: "-1s" });
    req.headers.authorization = `Bearer ${token}`;
    await protect(req, res, next);
    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(401);
  });
});
