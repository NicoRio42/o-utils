import { z } from "zod";
import type Control from "./control.js";
import { controlSchema } from "./control.js";
import type CourseMap from "./course-map.js";
import { courseMapValidator } from "./course-map.js";
import type Leg from "./leg.js";
import { legValidator, type LegWithSerializedNestedArrays } from "./leg.js";
import type Runner from "./runner.js";
import { runnerValidator } from "./runner.js";
import type Statistics from "./statistics.js";
import { statisticsValidator } from "./statistics.js";

export const courseDataWithoutRunnersValidator = z.object({
  id: z.string(),
  legs: z.array(legValidator),
  course: z.array(controlSchema),
  map: courseMapValidator.nullable(),
  timeOffset: z.number(),
  statistics: statisticsValidator.nullable(),
});

export const courseDataValidator = courseDataWithoutRunnersValidator.extend({
  runners: z.array(runnerValidator),
});

export interface CourseDataWithoutRunnersAndLegs {
  id: string;
  course: Control[];
  map: CourseMap | null;
  timeOffset: number;
  statistics: Statistics | null;
}
export interface CourseDataWithoutRunnersWithSerializedNestedArrays
  extends CourseDataWithoutRunnersAndLegs {
  legs: LegWithSerializedNestedArrays[];
}
export interface CourseDataWithoutRunners
  extends CourseDataWithoutRunnersAndLegs {
  legs: Leg[];
}

export default interface CourseData extends CourseDataWithoutRunners {
  runners: Runner[];
}
