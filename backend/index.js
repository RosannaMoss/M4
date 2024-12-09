const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(
  process.env.API_KEY || "AIzaSyCqQeVzjIUku7mJOYdddX3Xo1e422tUlyI"
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Insurance products and rules
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

// In-memory state to track user sessions
const sessions = {};

// Start a new chat session
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
    // Initialize or continue the chat session
    let chatSession = sessions[sessionId];
    if (!chatSession) {
      chatSession = {
        chat: initializeChat(),
        userContext: {},
      };
      sessions[sessionId] = chatSession;

      const intro =
        "I’m Tina. I help you choose the right auto insurance policy. May I ask you a few questions to make sure I recommend the best policy for you?";
      await chatSession.chat.sendMessage(intro);
    }

    // Send the user message to the AI model
    const result = await chatSession.chat.sendMessage(userMessage.toString());
    const botMessage = result.response.text();
    console.log("AI Response:", botMessage);

    const userContext = chatSession.userContext;

    // Track user's input and determine the next step
    if (botMessage.includes("vehicle do you own")) {
      userContext.vehicleType = userMessage.toLowerCase();
    } else if (botMessage.includes("How old is your vehicle")) {
      userContext.vehicleAge = parseInt(userMessage, 10);
    }

    // Check if the chat has enough context to recommend insurance
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

    // Respond with the next question
    res.json({ botResponse: botMessage, sessionId });
  } catch (error) {
    console.error("Error during chat:", error);
    res.status(500).json({
      botResponse: "I'm experiencing technical issues. Please try again later.",
    });
  }
});

// Helper function to determine recommendations
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

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
