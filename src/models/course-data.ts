import { z } from "zod";
import { controlSchema } from "./control.js";
import { courseMapValidator } from "./course-map.js";
import { legValidator } from "./leg.js";
import { runnerValidator } from "./runner.js";
import { statisticsValidator } from "./statistics.js";

export const courseDataValidator = z.object({
  id: z.string(),
  legs: z.array(legValidator),
  course: z.array(controlSchema),
  map: courseMapValidator.nullable(),
  timeOffset: z.number(),
  statistics: statisticsValidator.nullable(),
  runners: z.array(runnerValidator),
});

export type CourseData = z.infer<typeof courseDataValidator>;
