#!/usr/bin/env node
/**
 * Ensures .env has required variables for local development.
 */
import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const examplePath = resolve(root, ".env.example");

const defaults = {
  AUTH_SECRET: () => randomBytes(32).toString("base64"),
  AUTH_URL: "http://localhost:3000",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  DATABASE_URL:
    "postgresql://postgres:postgres@localhost:5432/hunarhub?schema=public",
  GOOGLE_CLIENT_ID: "your-google-client-id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "your-google-client-secret",
};

function parseEnv(content) {
  const map = new Map();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

function serializeEnv(map) {
  const lines = ["# HunarHub local environment (generated/updated by setup:env)"];
  for (const [key, value] of map) {
    lines.push(`${key}="${value}"`);
  }
  lines.push("");
  return lines.join("\n");
}

let map = new Map();

if (existsSync(envPath)) {
  map = parseEnv(readFileSync(envPath, "utf8"));
  console.log("Updating existing .env …");
} else if (existsSync(examplePath)) {
  map = parseEnv(readFileSync(examplePath, "utf8"));
  console.log("Creating .env from .env.example …");
} else {
  console.log("Creating new .env …");
}

for (const [key, valueOrFn] of Object.entries(defaults)) {
  const current = map.get(key);
  const isEmpty = !current || current.includes("your-") || current === "";

  if (isEmpty) {
    const value =
      typeof valueOrFn === "function" ? valueOrFn() : valueOrFn;
    map.set(key, value);
    console.log(`  + ${key}`);
  }
}

// Replace broken Prisma dev URLs (localhost:51xxx) with Docker Postgres URL
const db = map.get("DATABASE_URL") ?? "";
if (/localhost:51\d{3}/.test(db)) {
  map.set("DATABASE_URL", defaults.DATABASE_URL);
  console.log("  ~ DATABASE_URL (replaced unreachable Prisma dev port)");
}

writeFileSync(envPath, serializeEnv(map), "utf8");
console.log("\nDone. Next steps:");
console.log("  1. docker compose up -d   # start local Postgres");
console.log("  2. npm run db:push        # apply schema");
console.log("  3. Add Google OAuth keys to .env (optional for browse UI)");
console.log("  4. npm run dev");
