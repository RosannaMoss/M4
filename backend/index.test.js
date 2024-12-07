const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import functions
const { getNextQuestion } = require("./index");

// Mocking AI Response Generator
jest.mock("./index", () => ({
  generateAIResponse: jest.fn((prompt) => `Mocked response for: ${prompt}`),
  getNextQuestion: jest.requireActual("./path-to-your-code").getNextQuestion,
}));

// Setup Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 3000;
const routeHandler = require("./path-to-your-code"); // Import the route handler
app.post("/api/chat", routeHandler);

// Mock Chat Context
const initialChatContext = {
  optedIn: false,
  stage: null,
  finished: false,
};

describe("Chat API Tests", () => {
  beforeEach(() => {
    global.chatContext = { ...initialChatContext };
  });

  test("1. Returns opt-in question when user starts chat", async () => {
    const res = await request(app).post("/api/chat").send({ userMessage: "" });

    expect(res.status).toBe(200);
    expect(res.body.botResponse).toContain(
      "May I ask you a few personal questions"
    );
    expect(global.chatContext.stage).toBe("opt-in");
  });

  test("2. Returns error for missing userMessage", async () => {
    const res = await request(app).post("/api/chat").send({});

    expect(res.status).toBe(400);
    expect(res.body.botResponse).toBe(
      "Invalid request. Please provide a userMessage."
    );
  });

  test("3. Handles 'no' response during opt-in", async () => {
    global.chatContext.stage = "opt-in";
    const res = await request(app)
      .post("/api/chat")
      .send({ userMessage: "no" });

    expect(res.status).toBe(200);
    expect(res.body.botResponse).toContain(
      "No problem! Feel free to reach out"
    );
    expect(global.chatContext.finished).toBe(true);
  });

  test("4. Asks for vehicle type after opt-in approval", async () => {
    global.chatContext.stage = "opt-in";
    const res = await request(app)
      .post("/api/chat")
      .send({ userMessage: "yes" });

    expect(res.status).toBe(200);
    expect(res.body.botResponse).toContain("What type of vehicle do you own?");
    expect(global.chatContext.stage).toBe("vehicle-type");
  });

  test("5. Rejects invalid vehicle types for MBI", async () => {
    global.chatContext.stage = "vehicle-type";
    const res = await request(app)
      .post("/api/chat")
      .send({ userMessage: "truck" });

    expect(res.status).toBe(200);
    expect(res.body.botResponse).toContain(
      "MBI is not available for trucks or racing cars"
    );
    expect(global.chatContext.finished).toBe(true);
  });

  test("6. Asks for vehicle age for valid vehicle types", async () => {
    global.chatContext.stage = "vehicle-type";
    const res = await request(app)
      .post("/api/chat")
      .send({ userMessage: "car" });

    expect(res.status).toBe(200);
    expect(res.body.botResponse).toContain("How old is your vehicle?");
    expect(global.chatContext.stage).toBe("vehicle-age");
  });

  test("7. Recommends policies based on vehicle age", async () => {
    global.chatContext.stage = "vehicle-age";
    const res = await request(app).post("/api/chat").send({ userMessage: "5" });

    expect(res.status).toBe(200);
    expect(res.body.botResponse).toContain("I recommend the following:");
    expect(res.body.botResponse).toContain("Comprehensive Car Insurance");
    expect(res.body.botResponse).toContain("Third Party Car Insurance");
    expect(global.chatContext.finished).toBe(true);
  });
});
