const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const usersController = require("../usersController");
const { client } = require("../../setup/db");

jest.mock("../../setup/db");

const app = express();
app.use(bodyParser.json());
app.post("/register", usersController.registerUser);
app.post("/login", usersController.loginUser);
app.get("/users", usersController.getAllUsers);

describe("Users Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      client.query.mockResolvedValueOnce({ rows: [] }); // No existing user
      client.query.mockResolvedValueOnce({
        rows: [{ id: 1, username: "testuser" }],
      }); // New user created

      const res = await request(app).post("/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(res.status).toBe(201);
      expect(res.body.username).toBe("testuser");
    });

    it("should not register a user with an existing username", async () => {
      client.query.mockResolvedValueOnce({
        rows: [{ id: 1, username: "testuser" }],
      }); // Existing user

      const res = await request(app).post("/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Username already exists");
    });
  });

  describe("loginUser", () => {
    it("should not login a user with invalid credentials", async () => {
      client.query.mockResolvedValueOnce({ rows: [] }); // No user found

      const res = await request(app).post("/login").send({
        username: "testuser",
        password: "password123",
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });
  });

  describe("getAllUsers", () => {
    it("should fetch all users", async () => {
      client.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            email: "testuser@example.com",
            name: "Test User",
          },
        ],
      });

      const res = await request(app).get("/users");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe("testuser");
    });
  });
});
