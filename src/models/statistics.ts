import { z } from "zod";

export const statisticsValidator = z.object({
  leader: z.array(z.number()),
  superman: z.array(z.number()),
  supermanSplits: z.array(z.number()),
  mistakesSum: z.array(z.number()),
});

export interface Statistics {
  leader: number[];
  superman: number[];
  supermanSplits: number[];
  mistakesSum: number[];
}
