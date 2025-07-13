import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
    WS_URL: process.env.WS_URL || "ws://localhost:8000",
  },
};

export default nextConfig;
