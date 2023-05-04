import { z } from "zod";

export interface LoggatorInternalEvent {
  id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  publish_date: Date;
  map_id: number;
  slug: string;
}

export interface LoggatorCompetitor {
  id: number;
  device_id: number;
  name: string;
  marker_color: string;
  shortname: string;
  startnumber?: any;
  start_time: Date;
  position: number;
  end_time: Date;
  club: string;
  tags: any[];
  device_battery: number;
}

export interface LoggatorSettings {
  latitude: string;
  longitude: string;
  zoom: string;
  tail_length: string;
  replay_speed: string;
  live_delay: string;
  publish_competitors: string;
  show_battery_info: string;
  show_distance_info: string;
  show_relative_time: string;
}
export interface LoggatorPoint {
  lat: number;
  lng: number;
}

export interface LoggatorCoordinates {
  bottomLeft: LoggatorPoint;
  bottomRight: LoggatorPoint;
  topRight: LoggatorPoint;
  topLeft: LoggatorPoint;
}

export interface Map {
  url: string;
  width: number;
  height: number;
  coordinates: LoggatorCoordinates;
  tiles: string;
  name: string;
}

export interface LoggatorEvent {
  event: LoggatorInternalEvent;
  competitors: LoggatorCompetitor[];
  tracks: string;
  settings: LoggatorSettings;
  map: Map | {};
  overlays: any[];
}

export const loggatorInternaleventSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  publish_date: z.date(),
  map_id: z.number(),
  slug: z.string(),
});

export const loggatorCompetitorSchema = z.object({
  id: z.number(),
  device_id: z.number(),
  name: z.string(),
  marker_color: z.string(),
  shortname: z.string(),
  startnumber: z.any().optional(),
  start_time: z.date(),
  position: z.number(),
  end_time: z.date(),
  club: z.string(),
  tags: z.array(z.any()),
  device_battery: z.number(),
});

export const loggatorSettingsSchema = z.object({
  latitude: z.string(),
  longitude: z.string(),
  zoom: z.string(),
  tail_length: z.string(),
  replay_speed: z.string(),
  live_delay: z.string(),
  publish_competitors: z.string(),
  show_battery_info: z.string(),
  show_distance_info: z.string(),
  show_relative_time: z.string(),
});

export const loggatorPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const loggatorCoordinatesSchema = z.object({
  bottomLeft: loggatorPointSchema,
  bottomRight: loggatorPointSchema,
  topRight: loggatorPointSchema,
  topLeft: loggatorPointSchema,
});

export const loggatorMapSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  coordinates: loggatorCoordinatesSchema,
  tiles: z.string(),
  name: z.string(),
});

export const loggatorEventSchema = z.object({
  event: loggatorInternaleventSchema,
  competitors: z.array(loggatorCompetitorSchema),
  tracks: z.string(),
  settings: loggatorSettingsSchema,
  map: z.union([loggatorMapSchema, z.object({})]),
  overlays: z.array(z.any()),
});
