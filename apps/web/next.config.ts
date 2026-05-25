import type { NextConfig } from "next";

function parseAllowedDevOrigins() {
  const fromEnv = process.env.LOCALDB_HUB_ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromEnv?.length) {
    return fromEnv;
  }

  return [
    "192.168.133.131",
    "192.168.133.131:3000",
    "http://192.168.133.131:3000",
    "localhost",
    "localhost:3000",
    "http://localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "http://127.0.0.1:3000"
  ];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: parseAllowedDevOrigins()
};

export default nextConfig;
