import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { LessonTable } from "./lesson";
import { createdAt, updatedAt } from "../schemaHelper";
import { relations } from "drizzle-orm";


export const UserLessonComleteTable = pgTable("user_lesson_complete",
    {
        userId:uuid().notNull().references(()=>UserTable.id, {onDelete:"cascade"}),
        lessonId:uuid().notNull().references(()=>LessonTable.id, {onDelete:"cascade"}),
        createdAt,
        updatedAt,
    }, t=> [primaryKey({columns:[t.userId, t.lessonId]})]
)



export const UserLessonCompleteTableRelationships = relations(UserLessonComleteTable, ({one})=>({
    user:one(UserTable,{
        fields:[UserLessonComleteTable.userId],
        references:[UserTable.id]
    }),
    lessonId:one(LessonTable,{
        fields:[UserLessonComleteTable.lessonId],
        references:[LessonTable.id]
    })


}))