import { expect } from "chai";
import { noteValidator } from "../../src/validators/noteValidator.js";
import { validationResult } from "express-validator";

describe("noteValidator", () => {
  // Helper to run the full validator chain against a mock request
  const runValidation = async (body) => {
    const req = { body };
    for (const validator of noteValidator) {
      await validator.run(req);
    }
    return validationResult(req);
  };

  it("should be an array of validators", () => {
    expect(noteValidator).to.be.an("array");
    expect(noteValidator).to.have.length(2);
  });

  it("should pass with valid title and content", async () => {
    const result = await runValidation({ title: "My Note", content: "Some content" });
    expect(result.isEmpty()).to.be.true;
  });

  it("should pass with valid title and empty string content", async () => {
    const result = await runValidation({ title: "My Note", content: "" });
    expect(result.isEmpty()).to.be.true;
  });

  it("should fail when title is missing", async () => {
    const result = await runValidation({ content: "Some content" });
    expect(result.isEmpty()).to.be.false;
    const errors = result.array();
    expect(errors.some((e) => e.path === "title")).to.be.true;
  });

  it("should fail when title is an empty string", async () => {
    const result = await runValidation({ title: "", content: "Some content" });
    expect(result.isEmpty()).to.be.false;
    const errors = result.array();
    expect(errors.some((e) => e.path === "title")).to.be.true;
  });

  it("should fail when title is not a string", async () => {
    const result = await runValidation({ title: 123, content: "text" });
    expect(result.isEmpty()).to.be.false;
    const errors = result.array();
    expect(errors.some((e) => e.path === "title")).to.be.true;
  });

  it("should fail when content is not a string", async () => {
    const result = await runValidation({ title: "Valid", content: 123 });
    expect(result.isEmpty()).to.be.false;
    const errors = result.array();
    expect(errors.some((e) => e.path === "content")).to.be.true;
  });

  it("should fail when content is missing", async () => {
    const result = await runValidation({ title: "Valid" });
    expect(result.isEmpty()).to.be.false;
    const errors = result.array();
    expect(errors.some((e) => e.path === "content")).to.be.true;
  });
});
