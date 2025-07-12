declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;  // Optional (you have a default fallback)
    DATABASE_URL: string;
    REDIS_URL: string;
    FRONTEND_URL: string;
    PORT: string;
    NODE_ENV: "development" | "production";
  }
}