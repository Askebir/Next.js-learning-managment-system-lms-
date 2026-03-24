import { integer, pgEnum, pgTable, PgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelper";
import { relations } from "drizzle-orm";
import { CourseProductTable } from "./courseProduct";
import { PurchaseTable } from "./purchase";

export const productStatuses = ["public", "private"] as const;
export type ProductStatuses = (typeof productStatuses)[number];
export const productStatusesEnum = pgEnum("product_status", productStatuses);

export const ProductTable = pgTable("products", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  imageUrl: text().notNull(),
  priceInDollars: integer().notNull(),
  status: productStatusesEnum().notNull().default("private"),
  createdAt,
  updatedAt,
});

export const ProductRelationships = relations(
  ProductTable,
  ({ one, many }) => ({
    courseProducts: many(CourseProductTable),
    purchaseProducts: many(PurchaseTable),
  }),
);
