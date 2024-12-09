const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Mock GoogleGenerativeAI
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          startChat: jest.fn().mockReturnValue({
            sendMessage: jest.fn().mockResolvedValue({
              response: { text: jest.fn().mockReturnValue("AI response") },
            }),
          }),
        }),
      };
    }),
  };
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("fake-api-key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const insuranceProducts = [
  {
    name: "Mechanical Breakdown Insurance (MBI)",
    description: "Coverage for unexpected mechanical failures.",
    rules: ["Not available to trucks or racing cars."],
  },
  {
    name: "Comprehensive Car Insurance",
    description: "Covers damages to your car and third-party vehicles.",
    rules: ["Only available for vehicles less than 10 years old."],
  },
  {
    name: "Third Party Car Insurance",
    description: "Covers damages caused to third parties.",
    rules: [],
  },
];

let sessions = {};

const initializeChat = () =>
  model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Start the conversation." }],
      },
    ],
  });

app.post("/api/chat", async (req, res) => {
  const { userMessage, sessionId } = req.body;

  if (!userMessage || typeof userMessage !== "string") {
    return res
      .status(400)
      .json({ botResponse: "Invalid input: Please provide a valid message." });
  }

  try {
    let chatSession = sessions[sessionId];
    if (!chatSession) {
      chatSession = {
        chat: initializeChat(),
        userContext: {},
      };
      sessions[sessionId] = chatSession;

      const intro = `
        I’m Tina. I help you choose the right auto insurance policy. May I ask you a few questions to make sure I recommend the best policy for you? 
        Please note that I do not need to know your location. 
        Here are the available insurance products:
        - Mechanical Breakdown Insurance (MBI): Coverage for unexpected mechanical failures. Not available to trucks or racing cars.
        - Comprehensive Car Insurance: Covers damages to your car and third-party vehicles. Only available for vehicles less than 10 years old.
        - Third Party Car Insurance: Covers damages caused to third parties.
        Please use these products to make recommendations and ask questions one at a time. 
        Try to ask at least three questions before offering an insurance product.
        Do not use any special formatting like bold or italics in your responses.
      `;
      await chatSession.chat.sendMessage(intro);
    }

    const result = await chatSession.chat.sendMessage(userMessage.toString());
    let botMessage = result.response.text();
    botMessage = botMessage.replace(/[*_~`]/g, "");

    const userContext = chatSession.userContext;

    if (botMessage.includes("vehicle do you own")) {
      userContext.vehicleType = userMessage.toLowerCase();
    } else if (botMessage.includes("How old is your vehicle")) {
      userContext.vehicleAge = parseInt(userMessage, 10);
    }

    if (userContext.vehicleType && userContext.vehicleAge !== undefined) {
      const recommendations = getRecommendations(userContext);
      const recommendationText = recommendations
        .map((product) => `- ${product.name}: ${product.description}`)
        .join("\n");

      return res.json({
        botResponse: `Based on your input, I recommend the following:\n${recommendationText}`,
        sessionId,
      });
    }

    res.json({ botResponse: botMessage, sessionId });
  } catch (error) {
    console.error("Error during chat:", error);
    res.status(500).json({
      botResponse: "I'm experiencing technical issues. Please try again later.",
    });
  }
});

const getRecommendations = (userContext) => {
  const { vehicleType, vehicleAge } = userContext;
  const recommendations = [];

  if (vehicleType === "truck" || vehicleType === "racing car") {
    return [
      {
        name: "Third Party Car Insurance",
        description: "Covers damages caused to third parties.",
      },
    ];
  }

  if (vehicleAge !== undefined) {
    if (vehicleAge < 10) {
      recommendations.push(
        insuranceProducts.find((p) => p.name === "Comprehensive Car Insurance")
      );
    }
  }

  recommendations.push(
    insuranceProducts.find((p) => p.name === "Third Party Car Insurance")
  );
  return recommendations;
};

sessions = {};

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

describe("API Tests", () => {
  it("should return 400 for invalid input", async () => {
    const response = await request(app).post("/api/chat").send({});
    expect(response.status).toBe(400);
    expect(response.body.botResponse).toBe(
      "Invalid input: Please provide a valid message."
    );
  });

  it("should initialize a new chat session", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ userMessage: "Hello", sessionId: "123" });
    expect(response.status).toBe(200);
    expect(response.body.botResponse).toContain("I’m Tina");
  });

  it("should continue an existing chat session", async () => {
    sessions["123"] = {
      chat: initializeChat(),
      userContext: {},
    };
    const response = await request(app)
      .post("/api/chat")
      .send({ userMessage: "Hello again", sessionId: "123" });
    expect(response.status).toBe(200);
    expect(response.body.botResponse).toBe("AI response");
  });

  it("should recommend insurance based on vehicle type and age", async () => {
    sessions["123"] = {
      chat: initializeChat(),
      userContext: { vehicleType: "car", vehicleAge: 5 },
    };
    const response = await request(app)
      .post("/api/chat")
      .send({ userMessage: "My car is 5 years old", sessionId: "123" });
    expect(response.status).toBe(200);
    expect(response.body.botResponse).toContain(
      "Based on your input, I recommend the following:"
    );
  });

  it("should sanitize AI response", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ userMessage: "Hello", sessionId: "123" });
    expect(response.status).toBe(200);
    expect(response.body.botResponse).not.toContain("*");
    expect(response.body.botResponse).not.toContain("_");
    expect(response.body.botResponse).not.toContain("~");
    expect(response.body.botResponse).not.toContain("`");
  });

  it("should handle errors during chat", async () => {
    model.startChat = jest.fn().mockImplementation(() => {
      throw new Error("Test error");
    });
    const response = await request(app)
      .post("/api/chat")
      .send({ userMessage: "Hello", sessionId: "123" });
    expect(response.status).toBe(500);
    expect(response.body.botResponse).toBe(
      "I'm experiencing technical issues. Please try again later."
    );
  });

  it("should get recommendations based on vehicle type and age", () => {
    const userContext = { vehicleType: "car", vehicleAge: 5 };
    const recommendations = getRecommendations(userContext);
    expect(recommendations).toEqual([
      {
        name: "Comprehensive Car Insurance",
        description: "Covers damages to your car and third-party vehicles.",
      },
      {
        name: "Third Party Car Insurance",
        description: "Covers damages caused to third parties.",
      },
    ]);
  });
});
