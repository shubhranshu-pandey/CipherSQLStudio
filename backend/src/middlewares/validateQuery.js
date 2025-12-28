const Joi = require("joi");

// SQL keywords that are not allowed (destructive operations)
const FORBIDDEN_KEYWORDS = [
  "DROP",
  "DELETE",
  "INSERT",
  "UPDATE",
  "ALTER",
  "CREATE",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "COMMIT",
  "ROLLBACK",
  "SAVEPOINT",
  "SET",
  "LOCK",
  "UNLOCK",
  "CALL",
  "EXEC",
  "EXECUTE",
  "DECLARE",
];

// SQL keywords that are allowed (read-only operations)
const ALLOWED_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "ON",
  "GROUP",
  "BY",
  "HAVING",
  "ORDER",
  "LIMIT",
  "OFFSET",
  "DISTINCT",
  "AS",
  "AND",
  "OR",
  "NOT",
  "IN",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "IS",
  "NULL",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "UNION",
  "INTERSECT",
  "EXCEPT",
  "WITH",
  "RECURSIVE",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "SUBSTRING",
  "CONCAT",
  "UPPER",
  "LOWER",
  "TRIM",
  "COALESCE",
];

const validateSQLQuery = (req, res, next) => {
  const schema = Joi.object({
    query: Joi.string().required().min(5).max(2000).trim().messages({
      "string.empty": "SQL query is required",
      "string.min": "SQL query must be at least 5 characters long",
      "string.max": "SQL query must not exceed 2000 characters",
    }),
    assignmentId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Invalid assignment ID format",
      }),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  // Normalize query for validation
  const normalizedQuery = value.query.toUpperCase().trim();

  // Check for forbidden keywords
  const hasForbiddenKeywords = FORBIDDEN_KEYWORDS.some((keyword) =>
    normalizedQuery.includes(keyword)
  );

  if (hasForbiddenKeywords) {
    return res.status(400).json({
      success: false,
      error:
        "Query contains forbidden operations. Only SELECT statements are allowed.",
    });
  }

  // Ensure query starts with SELECT
  if (!normalizedQuery.startsWith("SELECT")) {
    return res.status(400).json({
      success: false,
      error: "Only SELECT queries are allowed",
    });
  }

  // Check for potential SQL injection patterns
  const suspiciousPatterns = [
    /;\s*(DROP|DELETE|INSERT|UPDATE|ALTER)/i,
    /UNION.*SELECT.*FROM/i,
    /--.*$/m,
    /\/\*.*\*\//,
    /xp_cmdshell/i,
    /sp_executesql/i,
  ];

  const hasSuspiciousPatterns = suspiciousPatterns.some((pattern) =>
    pattern.test(value.query)
  );

  if (hasSuspiciousPatterns) {
    return res.status(400).json({
      success: false,
      error: "Query contains potentially unsafe patterns",
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = { validateSQLQuery };
