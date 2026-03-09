
import { relations } from "drizzle-orm";
import { createdAt, id, updatedAt } from "../schemaHelper";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { UserCourseAccessTable } from "./userCourseAccess";
import { PurchaseTable } from "./purchase";
import { UserLessonComleteTable } from "./userLessonComplete";
import { LessonTable } from "./lesson";

export const userRoles = ["user", "admin"] as const
export type UserRole = (typeof userRoles)[number]
export const userRoleEnum = pgEnum("user_role", userRoles)

export const UserTable = pgTable("users",{
    id,
    clerkUserId: text().notNull().unique(),
    email: text().notNull(),
    name: text().notNull(),
    role: userRoleEnum().notNull().default("user"),
    imageUrl:text(),
    deletedAt: timestamp({withTimezone: true}),
    createdAt,
    updatedAt,
})


export const UserRelationships = relations(UserTable,({many})=>({
    userCourseAccesses:many(UserCourseAccessTable),
    userPurchase:many(PurchaseTable),
    

}))