import { z } from "zod";

export interface TwoDRerunMap {
  imagelink: string;
  width: string;
  height: string;
  calstring: string;
}

export interface TwoDRerunRoute {
  indexnumber: number;
  runnername: string;
  latarray: number[];
  lngarray: number[];
  timearray: number[];
  splits: { index: number | null }[];
  zerotime: number;
  manualsplits: number;
  unit: string;
}

export interface TwoDRerunEventData {
  status: string;
  map: TwoDRerunMap;
  routes: TwoDRerunRoute[];
}

export const twoDRerunMapSchema = z.object({
  imagelink: z.string(),
  width: z.string(),
  height: z.string(),
  calstring: z.string(),
});

export const twoDRerunRouteSchema = z.object({
  unit: z.string(),
  runnername: z.string(),
  lats: z.string(),
  lngs: z.string(),
  times: z.string(),
  starttime: z.string(),
});

export const twoDRerunEventDataSchema = z.object({
  status: z.string(),
  map: twoDRerunMapSchema,
  routes: z.array(twoDRerunRouteSchema),
});
