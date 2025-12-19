import { connectToDatabase, disconnectDatabase } from "../src/shared/database"
import request from "supertest";

const api = request("http://localhost:8000");
describe("Create User API", () => {
  let payload = {
      name: "israel",
      lastName: "isaac",
      email: "israel@mail.com",
      mobileNumber: "9790327623",
      age: 1
    };

  beforeEach(() => {
    console.log("before each")
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("should create user and persist in DB", async () => {
    // 1. Call API
    const response = await api.post("/users").send(payload);
    // 2. Status code assertion
    expect(response.status).toBe(201);

    // 3. Response body assertion
    // expect(response.body).toHaveProperty("userId");

    // 4. DB assertion
    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ email: payload.email });

    expect(user).not.toBeNull();
    expect(user?.name).toBe("israel");
  });
});