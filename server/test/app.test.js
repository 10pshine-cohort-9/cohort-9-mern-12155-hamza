import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";
import { app } from "../src/app.js";

describe("app", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("GET /api/health", () => {
    it("should return 200 with success message", async () => {
      const res = await supertest(app).get("/api/health");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        success: true,
        message: "Server is running",
      });
    });
  });

  describe("CORS", () => {
    it("should include CORS headers in responses", async () => {
      const res = await supertest(app)
        .options("/api/health")
        .set("Origin", process.env.CORS_ORIGIN || "http://localhost:5173");

      expect(res.headers["access-control-allow-origin"]).to.exist;
    });
  });

  describe("JSON body parsing", () => {
    it("should parse JSON request bodies", async () => {
      // Sending a POST to auth/signup to verify JSON parsing works
      // (the route exists, so we know the body will be parsed)
      const res = await supertest(app)
        .post("/api/auth/signup")
        .send({ email: "test@test.com", password: "pass" })
        .set("Content-Type", "application/json");

      // We don't care about the actual result, just that it didn't fail
      // with a parsing error - it should get through to the controller
      expect(res.status).to.not.equal(415); // Not "Unsupported Media Type"
    });
  });

  describe("x-powered-by header", () => {
    it("should not expose x-powered-by header", async () => {
      const res = await supertest(app).get("/api/health");

      expect(res.headers["x-powered-by"]).to.be.undefined;
    });
  });

  describe("404 catch-all", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await supertest(app).get("/api/nonexistent-route");

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        success: false,
        message: "Route not found",
      });
    });

    it("should return 404 for unknown POST routes", async () => {
      const res = await supertest(app).post("/api/does-not-exist");

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        success: false,
        message: "Route not found",
      });
    });
  });

  describe("route mounting", () => {
    it("should mount auth routes under /api/auth", async () => {
      // POST /api/auth/login should not return 404 (it's a real route)
      const res = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "password" });

      expect(res.status).to.not.equal(404);
    });

    it("should mount note routes under /api/notes", async () => {
      // GET /api/notes should not return 404 (it requires auth, so it should return 401)
      const res = await supertest(app).get("/api/notes");

      expect(res.status).to.not.equal(404);
    });

    it("should protect note routes with authentication", async () => {
      const res = await supertest(app).get("/api/notes");

      expect(res.status).to.equal(401);
    });
  });
});
