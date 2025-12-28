const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  },
  problemStatement: {
    type: String,
    required: true,
    trim: true,
  },
  question: {
    type: String,
    trim: true,
  },
  requirements: [
    {
      type: String,
      required: true,
    },
  ],
  constraints: [
    {
      type: String,
    },
  ],
  sampleTables: [
    {
      tableName: {
        type: String,
        required: true,
      },
      columns: [
        {
          columnName: {
            type: String,
            required: true,
          },
          dataType: {
            type: String,
            required: true,
          },
        },
      ],
      rows: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
    },
  ],
  expectedOutput: {
    type: {
      type: String,
      enum: ["table", "single_value", "column", "count"],
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  // Keep old schema fields for backward compatibility
  schema: [
    {
      tableName: String,
      schema: [
        {
          columnName: String,
          dataType: String,
          constraints: [String],
        },
      ],
    },
  ],
  expectedResultStructure: {
    columns: [String],
    description: String,
  },
  hints: [
    {
      level: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

assignmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

assignmentSchema.index({ difficulty: 1, isActive: 1 });
assignmentSchema.index({ tags: 1 });
assignmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
