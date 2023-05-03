import { z } from "zod";

export interface Map {
  imagelink: string;
  width: string;
  height: string;
  calstring: string;
}

export interface Route {
  unit: string;
  runnername: string;
  lats: string;
  lngs: string;
  times: string;
  starttime: string;
}

export interface Rerun2DEventData {
  status: string;
  map: Map;
  routes: Route[];
}

export const mapSchema = z.object({
  imagelink: z.string(),
  width: z.string(),
  height: z.string(),
  calstring: z.string(),
});

export const routeSchema = z.object({
  unit: z.string(),
  runnername: z.string(),
  lats: z.string(),
  lngs: z.string(),
  times: z.string(),
  starttime: z.string(),
});

export const rerun2DEventDataSchema = z.object({
  status: z.string(),
  map: mapSchema,
  routes: z.array(routeSchema),
});
