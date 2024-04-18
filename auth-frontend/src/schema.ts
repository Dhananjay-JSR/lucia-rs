import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  user_sub: text("user_sub").notNull(),
  user_name: text("user_name").notNull(),
  user_picture: text("user_picture"),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
