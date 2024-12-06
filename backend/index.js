const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const PORT = 3000; // Move this to dotenv in production

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("AIzaSyBC16h2iWOSrNSRWgkezrOo6ayTwZuDH7s");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Insurance Products and Rules
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

// Helper: Generate AI Response
async function generateAIResponse(prompt) {
  try {
    const response = await model.predict({
      prompt,
      temperature: 0.7,
      maxOutputTokens: 200,
    });

    // Log the raw response for debugging
    console.log("AI API Response:", response);

    const output = response.data?.candidates?.[0]?.output;
    if (!output) {
      console.error("No output in AI response:", response);
      return "Sorry, I couldn't generate a response.";
    }
    return output;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I’m experiencing technical issues. Please try again later.";
  }
}

// Chat Flow Logic
function getNextQuestion(userMessage, context) {
  if (!context.optedIn) {
    return {
      botResponse:
        "May I ask you a few personal questions to help recommend the best policy for you? (yes/no)",
      context: { ...context, stage: "opt-in" },
    };
  }

  if (context.stage === "opt-in") {
    if (userMessage.toLowerCase() === "yes") {
      return {
        botResponse:
          "What type of vehicle do you own? (e.g., car, truck, racing car)",
        context: { ...context, optedIn: true, stage: "vehicle-type" },
      };
    }
    return {
      botResponse:
        "No problem! Feel free to reach out if you change your mind.",
      context: { ...context, optedIn: false, finished: true },
    };
  }

  if (context.stage === "vehicle-type") {
    const vehicleType = userMessage.toLowerCase();
    if (["truck", "racing car"].includes(vehicleType)) {
      return {
        botResponse:
          "Based on your input, Mechanical Breakdown Insurance (MBI) is not available for trucks or racing cars.",
        context: { ...context, stage: "finished" },
      };
    }
    return {
      botResponse: "How old is your vehicle? (in years)",
      context: { ...context, vehicleType, stage: "vehicle-age" },
    };
  }

  if (context.stage === "vehicle-age") {
    const vehicleAge = parseInt(userMessage, 10);
    const recommendations = [];

    if (vehicleAge < 10) recommendations.push(insuranceProducts[1]);
    recommendations.push(insuranceProducts[2]);

    return {
      botResponse: `Based on your input, I recommend the following:\n${recommendations
        .map((p) => `- ${p.name}: ${p.description}`)
        .join("\n")}`,
      context: { ...context, finished: true },
    };
  }

  return {
    botResponse: "Thank you for chatting with Tina!",
    context: { ...context, finished: true },
  };
}

// Chat Context
let chatContext = { optedIn: false, stage: null, finished: false };

// API Route
app.post("/api/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({
        botResponse: "Invalid request. Please provide a userMessage.",
      });
    }

    const { botResponse, context } = getNextQuestion(userMessage, chatContext);

    if (!context.finished) {
      const aiResponse = await generateAIResponse(botResponse);
      chatContext = context; // Update context
      return res.status(200).json({ botResponse: aiResponse });
    } else {
      return res.status(200).json({ botResponse });
    }
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({
      botResponse: "An error occurred on the server. Please try again later.",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
