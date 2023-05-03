import { describe, expect, test } from "vitest";
import type { MapCalibration } from "../models/course-map.js";
import {
  CoordinatesConverter,
  getMapCalibrationFromCalString,
} from "./coords-converter.js";

describe("Coordinates converter", () => {
  const mapCallibration = getMapCalibrationFromCalString(calstring);

  test("getMapCalibrationFromCalString", () => {
    expect(mapCallibration).toStrictEqual(expectedMapCallibration);
  });

  const coordsConverter = new CoordinatesConverter(expectedMapCallibration);

  const [x, y] = coordsConverter.latLongToXY([
    45.79130295443253, 4.848683532105073,
  ]);

  test("latLongToXY", () => {
    expect([x, y]).toStrictEqual([863.5162690882571, 2867.664329510182]);
  });

  const [lat, lon] = coordsConverter.xYToLatLong([
    863.5162690847026, 2867.6643295786716,
  ]);

  test("xYToLatLong", () => {
    expect([lat, lon]).toStrictEqual([45.791302954432375, 4.848683532105056]);
  });
});

const calstring =
  "4.845917897863|45.797865365427|1|1|4.8545093729956|45.797831552578|2630|1|4.854449410137|45.790424748573|2630|3242";

const expectedMapCallibration: MapCalibration = [
  {
    gps: { lat: 45.797865365427, lon: 4.845917897863 },
    point: { x: 1, y: 1 },
  },
  {
    gps: { lat: 45.797831552578, lon: 4.8545093729956 },
    point: { x: 2630, y: 1 },
  },
  {
    gps: { lat: 45.790424748573, lon: 4.854449410137 },
    point: { x: 2630, y: 3242 },
  },
];
