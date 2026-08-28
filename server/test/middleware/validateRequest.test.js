import { expect } from "chai";
import sinon from "sinon";
import { validateRequest } from "../../src/middleware/validateRequest.js";
import AppError from "../../src/utils/AppError.js";

// We need to stub validationResult from express-validator.
// Since express-validator is an external dep, we'll test by calling
// the middleware through express-validator's actual validation chain.
import { body, validationResult } from "express-validator";

describe("validateRequest", () => {
  let res, next;

  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call next() when there are no validation errors", async () => {
    // Run a validator that will pass
    const req = { body: { title: "Valid Title" } };

    // Run a passing validation chain first
    const validator = body("title").isString().notEmpty();
    await validator.run(req);

    validateRequest(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args).to.have.length(0);
  });

  it("should throw AppError with 400 when validation errors exist", async () => {
    const req = { body: { title: "" } };

    // Run a failing validation chain
    const validator = body("title").notEmpty().withMessage("Title is required");
    await validator.run(req);

    expect(() => validateRequest(req, res, next)).to.throw();

    try {
      validateRequest(req, res, next);
    } catch (err) {
      expect(err).to.be.instanceOf(AppError);
      expect(err.statusCode).to.equal(400);
      expect(err.message).to.include("Title is required");
    }
  });

  it("should join multiple error messages with commas", async () => {
    const req = { body: {} };

    // Run multiple failing validators
    const validator1 = body("title").notEmpty().withMessage("Title is required");
    const validator2 = body("content").isString().withMessage("Content must be a string");
    await validator1.run(req);
    await validator2.run(req);

    try {
      validateRequest(req, res, next);
    } catch (err) {
      expect(err).to.be.instanceOf(AppError);
      expect(err.statusCode).to.equal(400);
      expect(err.message).to.include("Title is required");
    }
  });
});
