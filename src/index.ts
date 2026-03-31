import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./drizzle/schema";
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

// import { drizzle } from "drizzle-orm/neon-http";

// import * as schema from "./drizzle/schema";

// export const db = drizzle(process.env.DATABASE_URL!, { schema });

// import { drizzle } from 'drizzle-orm/neon-http';

// const db = drizzle(process.env.DATABASE_URL);
