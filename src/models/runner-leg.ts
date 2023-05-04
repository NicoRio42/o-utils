import { z } from "zod";
import type { Routechoice } from "./routechoice.js";
import { routechoiceValidator } from "./routechoice.js";

export const runnerLegValidator = z.object({
  startControlCode: z.string(),
  finishControlCode: z.string(),
  timeOverall: z.number(),
  time: z.number(),
  rankSplit: z.number(),
  timeBehindSplit: z.number(),
  rankOverall: z.number(),
  timeBehindOverall: z.number(),
  timeBehindSuperman: z.number(),
  isMistake: z.boolean(),
  timeLoss: z.number(),
  routeChoiceTimeLoss: z.nullable(z.number()),
  detectedRouteChoice: z.nullable(routechoiceValidator),
  manualRouteChoice: z.nullable(routechoiceValidator),
});

export interface RunnerLeg {
  startControlCode: string;
  finishControlCode: string;
  timeOverall: number;
  time: number;
  rankSplit: number;
  timeBehindSplit: number;
  rankOverall: number;
  timeBehindOverall: number;
  timeBehindSuperman: number;
  isMistake: boolean;
  timeLoss: number;
  routeChoiceTimeLoss: number | null;
  detectedRouteChoice: Routechoice | null;
  manualRouteChoice: Routechoice | null;
}

export const EMPTY_RUNNER_LEG: RunnerLeg = {
  startControlCode: "0",
  finishControlCode: "0",
  timeOverall: 0,
  time: 0,
  rankSplit: 0,
  timeBehindSplit: 0,
  rankOverall: 0,
  timeBehindOverall: 0,
  timeBehindSuperman: 0,
  isMistake: false,
  timeLoss: 0,
  routeChoiceTimeLoss: null,
  detectedRouteChoice: null,
  manualRouteChoice: null,
};
