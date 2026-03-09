import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./drizzle/schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });

// import { drizzle } from 'drizzle-orm/neon-http';

// const db = drizzle(process.env.DATABASE_URL);
