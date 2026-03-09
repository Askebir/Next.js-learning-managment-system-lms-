
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
 out:"./src/drizzle/migrations",
  schema:"./src/drizzle/schema.ts",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});



// import {defineConfig} from "drizzle-kit"
// import { env } from "./src/data/env/server"

// export default defineConfig({
//     out:"./src/drizzle/migrations",
//     schema:"./src/drizzle/schema.ts",
//     dialect: "postgresql",
//     strict:true,
//     verbose:true,
//     dbCredentials:{
//         password: env.DB_PASSWORD,
//         user: env.DB_USER,
//         database: env.DB_NAME,
//         host: env.DB_HOST,
//         ssl:false
//     }

// })