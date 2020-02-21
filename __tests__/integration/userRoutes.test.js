process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/userModel");

let testUser1;

describe("user Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM users");
    testUser1 = await User.create({
      username: "testUser",
      password: "browns",
      first_name: "Test",
      last_name: "User",
      email: "test@testmail.com",
      photo_url: "testpicurl"
    });
  });

  describe("GET /users", function () {
    test("Can get all users", async function () {
      let resp = await request(app).get("/users");
      expect(resp.body).toEqual({ users: expect.any(Array) });
      expect(resp.body.users.length).toBe(1);
    });
  });

  describe("POST /users", function () {
    test("Can create a new user", async function () {
      let testUser2 = {
        username: "testUser2",
        password: "browns",
        first_name: "Test2",
        last_name: "User2",
        email: "test2@testmail.com",
        photo_url: "testpicurl2"
      };

      let resp = await request(app)
        .post("/users")
        .send(testUser2);

      delete testUser2.password;

      const allUsers = await User.getUsers();

      expect(resp.body).toEqual({ user: testUser2 });
      expect(allUsers.length).toBe(2);
    });

    test("Can not create user with invalid input", async function () {
      let invalidUser = { username: 5 }
      let resp = await request(app)
        .post("/users")
        .send(invalidUser);

      const allUsers = await User.getUsers();

      expect(resp.body).toEqual({ message: expect.any(Array), status: 400 })
      expect(allUsers.length).toEqual(1);
    });
  });

  describe("GET /users/:username", function () {
    test("Can get a user from their username", async function () {
      let username = testUser1.username;
      let resp = await request(app).get(`/users/${username}`);
      expect(resp.body).toEqual({ user: testUser1 })
    });

    test("Returns 404 error on invalid username", async function () {
      let username = "invalidUsername";
      let resp = await request(app).get(`/users/${username}`);
      expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
    });
  });

  describe("Patch /users/:username", function () {
    test("Can patch user with a full object", async function () {
      // ('full' as in all of the schema-accepted updates)
      let testUser2 = {
        username: "testUser2",
        first_name: "Test2",
        last_name: "User2",
        email: "test2@testmail.com",
        photo_url: "testpicurl2"
      };

      let username = testUser1.username;
      let resp = await request(app)
        .patch(`/users/${username}`)
        .send(testUser2);

      expect(resp.body).toEqual({ user: testUser2 });
      let allUsers = await User.getUsers();
      expect(allUsers.length).toBe(1);
    });

    test("Can patch user with partial changes", async function () {
      let username = testUser1.username;
      let expected = {
        username,
        first_name: "ChangedName"
      };

      let resp = await request(app)
        .patch(`/users/${username}`)
        .send({ first_name: "ChangedName" });

      expect(resp.body).toMatchObject({ user: expected });
    });

  });

  describe("Delete /users/:username", function () {
    test("Can delete a user", async function () {
      let username = testUser1.username;
      let resp = await request(app).delete(`/users/${username}`);
      expect(resp.body).toEqual({ message: "Deleted" });
    });

    test("Returns 404 on invalid id", async function () {
      let username = "nonexistant";
      let resp = await request(app).delete(`/users/${username}`);
      expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
    })
  });
});

afterAll(async function () {
  await db.end();
});