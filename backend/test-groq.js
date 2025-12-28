require("dotenv").config();
const llmService = require("./src/services/llmService");

async function testGroq() {
  console.log("Testing Groq LLM Integration...\n");
  console.log(`Provider: ${process.env.LLM_PROVIDER}`);
  console.log(`Model: ${process.env.LLM_MODEL}\n`);

  const assignmentContext = {
    title: "Employee Information Retrieval",
    difficulty: "Easy",
    problemStatement: "Retrieve all employee information from the employees table.",
    requirements: ["SELECT", "basic"],
  };

  const userQuery = "SELECT * FROM employees";

  try {
    console.log("Generating hint...");
    const result = await llmService.generateHint(
      assignmentContext,
      userQuery,
      1
    );

    if (result.success) {
      console.log("\nSuccess!");
      console.log(`Provider: ${result.provider}`);
      console.log(`Model: ${result.model}`);
      console.log(`\nHint:\n${result.hint}`);
    } else {
      console.log("\nFailed!");
      console.log(`Error: ${result.error}`);
      console.log(`Fallback Hint: ${result.fallbackHint}`);
    }
  } catch (error) {
    console.error("\nError:", error.message);
  }
}

testGroq();
