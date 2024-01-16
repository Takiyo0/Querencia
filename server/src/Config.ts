const dev = true;

export const CONFIG = {
    DEV: dev,
    GOOGLE_CLIENT_ID: "redacted",
    GOOGLE_CLIENT_SECRET: "redacted",
    SERVER_URL: dev ? "http://localhost:3001" : "https://redacted.redacted",
    MONGODB_URI: dev ? "redacted" : "redacted",
    SHEETS_ID: dev ? "redacted" : "redacted",
    SESSION_SECRET: "redacted",
    PORT: 3001,
    OWNER_PASSWORD: "redacted",
    VERSION: `1.5.0-${dev ? "dev" : "prod"}.2510232010`
}