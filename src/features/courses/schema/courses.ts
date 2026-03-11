import z from "zod";

export const courseSchema = z.object({
  name: z.string().min(4, "Required"),
  description: z.string().min(1, "Required"),
});
