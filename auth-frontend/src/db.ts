import dotenv from "dotenv";
dotenv.config({
  path: [".env.local", ".env"],
});

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
const sql = neon(process.env.CONNECTION_STRING!);
export const db = drizzle(sql);
