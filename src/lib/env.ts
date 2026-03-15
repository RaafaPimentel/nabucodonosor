import { existsSync } from "fs";
import { config as loadEnvFile } from "dotenv";

if (existsSync(".env.local")) {
  loadEnvFile({ path: ".env.local", override: false });
}

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export const env = {
  NEWS_API_KEY: readEnv("NEWS_API_KEY"),
  GNEWS_API_KEY: readEnv("GNEWS_API_KEY"),
  NEWSCATCHER_API_KEY: readEnv("NEWSCATCHER_API_KEY"),
  CURRENTS_API_KEY: readEnv("CURRENTS_API_KEY"),
  SUPABASE_URL: readEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY") || readEnv("SUPABASE_KEY"),
  CRON_SECRET: readEnv("CRON_SECRET"),
  ADMIN_SESSION_SECRET: readEnv("ADMIN_SESSION_SECRET")
};
