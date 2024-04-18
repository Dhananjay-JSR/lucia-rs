require("dotenv").config({ path: [".env.local", ".env"] });
// import "dotenv/config";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./db";
(async () => {
  console.log("Starting Migration");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration Completed");
})();
