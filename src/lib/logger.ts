import pino from "pino";
import pinoPretty from "pino-pretty";

const isDev = process.env.NODE_ENV === "development";

// Turbopack struggles to resolve the worker-based transport that pino uses by default,
// so wire pino-pretty manually instead of letting pino spawn a worker thread.
const prettyStream = isDev
  ? pinoPretty({
      colorize: true,
      singleLine: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    })
  : undefined;

const logger = pino(
  {
    level: isDev ? "debug" : "info",
  },
  prettyStream
);

export default logger;
