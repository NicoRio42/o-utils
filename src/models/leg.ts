import { z } from "zod";
import { routechoiceValidator } from "./routechoice.js";

export const legValidator = z.object({
  id: z.string(),
  startControlCode: z.string(),
  finishControlCode: z.string(),
  startLat: z.number(),
  startLon: z.number(),
  finishLat: z.number(),
  finishLon: z.number(),
  routechoices: z.array(routechoiceValidator),
});

export type Leg = z.infer<typeof legValidator>;
