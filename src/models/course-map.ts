import { z } from "zod";

const mapCalibrationPointValidator = z.object({
  gps: z.object({ lat: z.number(), lon: z.number() }),
  point: z.object({ x: z.number(), y: z.number() }),
});

export const mapCalibrationValidator = z.tuple([
  mapCalibrationPointValidator,
  mapCalibrationPointValidator,
  mapCalibrationPointValidator,
]);

export const courseMapValidator = z.object({
  url: z.string(),
  calibration: mapCalibrationValidator,
});

export interface CourseMap {
  url: string;
  calibration: MapCalibration;
}

export interface MapCalibrationPoint {
  gps: { lat: number; lon: number };
  point: { x: number; y: number };
}

export type MapCalibration = [
  MapCalibrationPoint,
  MapCalibrationPoint,
  MapCalibrationPoint
];
