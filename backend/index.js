// cors and express installed. npm init -y done
const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const PORT = 3000; // Move this to dotenv in production

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
