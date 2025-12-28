const { GoogleGenerativeAI } = require("@google/generative-ai");

class LLMService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });
  }

  async generateHint(assignmentContext, userQuery, hintLevel = 1) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(
        assignmentContext,
        userQuery,
        hintLevel
      );

      const prompt = `${systemPrompt}\n\n${userPrompt}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const hint = await response.text();

      if (!hint) {
        throw new Error("No hint generated");
      }

      return {
        success: true,
        hint,
        level: hintLevel,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("LLM Service Error:", error);

      return {
        success: false,
        error: "Unable to generate hint at this time. Please try again.",
        fallbackHint: this.getFallbackHint(hintLevel),
      };
    }
  }

  buildSystemPrompt() {
    return `You are a SQL learning assistant for CipherSQLStudio. Your role is to provide helpful hints for SQL practice problems WITHOUT giving away the complete solution.

CRITICAL RULES:
1. NEVER provide the complete SQL query or exact syntax
2. NEVER reveal the final answer directly
3. Focus on concepts, strategy, and approach
4. Guide users to think through the problem step by step
5. Use encouraging and educational language
6. Keep hints concise but meaningful (2-3 sentences max)

HINT LEVELS:
- Level 1: High-level strategy and approach
- Level 2: More specific guidance on SQL concepts needed
- Level 3: Detailed conceptual guidance (still no exact syntax)

Your goal is to help users learn SQL by thinking through problems, not by copying solutions.`;
  }

  buildUserPrompt(assignmentContext, userQuery, hintLevel) {
    return `ASSIGNMENT CONTEXT:
Title: ${assignmentContext.title}
Difficulty: ${assignmentContext.difficulty}
Problem: ${assignmentContext.problemStatement}
Requirements: ${assignmentContext.requirements?.join(", ") || "None specified"}

USER'S CURRENT QUERY:
${userQuery || "No query provided yet"}

HINT LEVEL REQUESTED: ${hintLevel}

Please provide a helpful hint that guides the user toward the solution without revealing the exact answer. Focus on SQL concepts and problem-solving approach.`;
  }

  getFallbackHint(level) {
    const fallbackHints = {
      1: "Start by identifying which tables you need and what columns contain the information you're looking for. Think about the relationships between tables.",
      2: "Consider what SQL clauses you might need: WHERE for filtering, JOIN for combining tables, GROUP BY for aggregation, or ORDER BY for sorting.",
      3: "Break down the problem into smaller parts. What conditions need to be met? Do you need to aggregate data? Are there any specific patterns to match?",
    };

    return fallbackHints[level] || fallbackHints[1];
  }

  async validateHintQuality(hint) {
    // Simple validation to ensure hint doesn't contain obvious solutions
    const forbiddenPatterns = [
      /SELECT\s+\*\s+FROM/i,
      /WHERE\s+\w+\s*=\s*['"][^'"]+['"]/i,
      /JOIN\s+\w+\s+ON\s+\w+\.\w+\s*=\s*\w+\.\w+/i,
      /GROUP\s+BY\s+\w+/i,
      /ORDER\s+BY\s+\w+/i,
    ];

    const containsForbiddenPattern = forbiddenPatterns.some((pattern) =>
      pattern.test(hint)
    );

    if (containsForbiddenPattern) {
      return {
        isValid: false,
        reason: "Hint contains too much specific SQL syntax",
      };
    }

    return {
      isValid: true,
      reason: "Hint is appropriately conceptual",
    };
  }
}

module.exports = new LLMService();
