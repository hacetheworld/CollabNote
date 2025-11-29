/**
 * @fileoverview Configures Winston for structured JSON logging with multiple transports (console and file).
 * This logger automatically attaches common metadata for easy tracing and analysis.
 */
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url"; // <<< REQUIRED IMPORT

// --- ES Module Path Setup ---
// 1. Get the current file path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
// 2. Get the current directory path (the new __dirname)
const __dirname = path.dirname(__filename);
// --- Configuration Variables ---
const SERVICE_NAME = "CollabNote-API";
const LOG_FILE_PATH = path.join(__dirname, "..", "app.log"); // Saves logs to the root app.log
const NODE_ENV = process.env.NODE_ENV || "development";

// Define the custom format for structured logging
const jsonLogFormat = winston.format.combine(
  // Add the timestamp
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS Z",
  }),
  // Add default context (service, environment)
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp"],
  }),
  // Custom JSON format
  winston.format.json()
);

// Define the format for the console (more human-readable in dev)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss",
  }),
  winston.format.printf((info) => {
    // Extract correlation ID if present
    const cid = info.metadata.cid
      ? `[CID:${info.metadata.cid.substring(0, 8)}]`
      : "[N/A]";
    // Display custom message format
    return `${info.timestamp} ${cid} ${info.level}: ${info.message}`;
  })
);

// Create the Logger instance
export const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info", // Log DEBUG in development, INFO in production
  defaultMeta: {
    service: SERVICE_NAME,
    environment: NODE_ENV,
  },
  format: jsonLogFormat, // All logs default to JSON format
  transports: [
    // 1. Console Transport (use a human-readable format for development)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // 2. File Transport (permanent, machine-readable JSON logs)
    new winston.transports.File({
      filename: LOG_FILE_PATH,
      level: "info", // Always log INFO and above to the file
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle unhandled exceptions gracefully
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "..", "exceptions.log"),
    }),
  ],
});

// For development, print out a message showing the service name.
if (NODE_ENV !== "production") {
  logger.debug(`Logger initialized for service: ${SERVICE_NAME}`);
}
