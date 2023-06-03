import { z } from "zod";
import { twoDRerunTagSchema } from "./tag.js";

export const twoDRerunCourseExportSchema = z.object({
  tags: z.array(twoDRerunTagSchema),
  coursecoords: z.array(z.string()),
  otechinfo: z.object({}),
});

export type TwoDRerunCourseExport = z.infer<typeof twoDRerunCourseExportSchema>;
