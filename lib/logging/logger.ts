type LogFields = Record<string, unknown>;

function write(level: "info" | "error" | "warn", fields: LogFields) {
  const safe = Object.fromEntries(
    Object.entries(fields).filter(
      ([key]) => !/token|secret|password|authorization|apikey/i.test(key),
    ),
  );
  console[level](JSON.stringify({ timestamp: new Date().toISOString(), level, ...safe }));
}

export const logger = {
  info: (fields: LogFields) => write("info", fields),
  warn: (fields: LogFields) => write("warn", fields),
  error: (fields: LogFields) => write("error", fields),
};
