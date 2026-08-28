import { expect } from "chai";
import sinon from "sinon";
import errorHandler from "../../src/middleware/errorHandler.js";
import AppError from "../../src/utils/AppError.js";

describe("errorHandler", () => {
  let req, res, next;

  beforeEach(() => {
    req = { originalUrl: "/api/test", method: "GET" };
    res = {
      headersSent: false,
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  it("should return operational error with correct status code", () => {
    const err = new AppError("Not found", 404);
    errorHandler(err, req, res, next);
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ success: false, message: "Not found" })).to.be.true;
  });

  it("should return 500 for non-operational errors", () => {
    const err = new Error("Something broke");
    errorHandler(err, req, res, next);
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, message: "Internal server error" })).to.be.true;
  });

  it("should call next if headers already sent", () => {
    res.headersSent = true;
    const err = new AppError("Error", 400);
    errorHandler(err, req, res, next);
    expect(next.calledWith(err)).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it("should default to 500 for invalid status codes", () => {
    const err = new Error("Bad");
    err.statusCode = 999;
    errorHandler(err, req, res, next);
    expect(res.status.calledWith(500)).to.be.true;
  });
});
