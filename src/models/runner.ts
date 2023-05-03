import { z } from "zod";
import RunnerStatusEnum, {
  runnerStatusEnumValidator,
} from "./enums/runner-status-enum.js";
import { runnerLegValidator } from "./runner-leg.js";
import type { RunnerLeg } from "./runner-leg.js";

export const runnerTrackValidator = z.object({
  lats: z.array(z.number()),
  lons: z.array(z.number()),
  times: z.array(z.number()),
  color: z.string().startsWith("#"),
});

export interface RunnerTrack {
  lats: number[];
  lons: number[];
  times: number[];
  color: string;
}

export default interface Runner {
  id: string;
  trackingDeviceId: string | null;
  userId: string | null;
  status: RunnerStatusEnum;
  firstName: string;
  lastName: string;
  startTime: number;
  time: number | null;
  legs: (RunnerLeg | null)[];
  rank: number | null;
  timeBehind: number | null;
  totalTimeLost: number;
  track: RunnerTrack | null;
  timeOffset: number;
}

export const runnerValidator = z.object({
  id: z.string().uuid(),
  trackingDeviceId: z.string().nullable(),
  userId: z.string().nullable(),
  status: runnerStatusEnumValidator,
  firstName: z.string(),
  lastName: z.string(),
  startTime: z.number(),
  time: z.nullable(z.number()),
  legs: z.array(z.nullable(runnerLegValidator)),
  rank: z.nullable(z.number()),
  timeBehind: z.nullable(z.number()),
  totalTimeLost: z.number(),
  track: z.nullable(runnerTrackValidator),
  timeOffset: z.number(),
});
