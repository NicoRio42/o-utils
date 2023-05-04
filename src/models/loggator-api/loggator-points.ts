import { z } from "zod";

export interface LoggatorPoints {
  data: string;
}

export const loggatorPointsValidator = z.object({ data: z.string() });
