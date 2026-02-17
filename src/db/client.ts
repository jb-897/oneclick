import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL!;
// Supabase pooler / serverless-safe: disable prepared statements.
export const sql = postgres(connectionString, { ssl: "require", max: 10, prepare: false });
export const db = drizzle(sql);
