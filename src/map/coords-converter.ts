import { inv, matrix, multiply } from "mathjs";
import type { MapCalibration } from "../models/course-map.js";

export class CoordinatesConverter {
  private latLongToXYCoef: [number, number, number, number, number, number];
  private xYToLatLongCoef: [number, number, number, number, number, number];

  constructor(mapCallibration: MapCalibration) {
    this.latLongToXYCoef = multiply(
      inv(
        matrix([
          [mapCallibration[0].gps.lon, 0, mapCallibration[0].gps.lat, 0, 1, 0],
          [0, mapCallibration[0].gps.lon, 0, mapCallibration[0].gps.lat, 0, 1],
          [mapCallibration[1].gps.lon, 0, mapCallibration[1].gps.lat, 0, 1, 0],
          [0, mapCallibration[1].gps.lon, 0, mapCallibration[1].gps.lat, 0, 1],
          [mapCallibration[2].gps.lon, 0, mapCallibration[2].gps.lat, 0, 1, 0],
          [0, mapCallibration[2].gps.lon, 0, mapCallibration[2].gps.lat, 0, 1],
        ])
      ),
      [
        mapCallibration[0].point.x,
        mapCallibration[0].point.y,
        mapCallibration[1].point.x,
        mapCallibration[1].point.y,
        mapCallibration[2].point.x,
        mapCallibration[2].point.y,
      ]
    ).toArray() as [number, number, number, number, number, number];

    this.xYToLatLongCoef = multiply(
      inv(
        matrix([
          [mapCallibration[0].point.x, 0, mapCallibration[0].point.y, 0, 1, 0],
          [0, mapCallibration[0].point.x, 0, mapCallibration[0].point.y, 0, 1],
          [mapCallibration[1].point.x, 0, mapCallibration[1].point.y, 0, 1, 0],
          [0, mapCallibration[1].point.x, 0, mapCallibration[1].point.y, 0, 1],
          [mapCallibration[2].point.x, 0, mapCallibration[2].point.y, 0, 1, 0],
          [0, mapCallibration[2].point.x, 0, mapCallibration[2].point.y, 0, 1],
        ])
      ),
      [
        mapCallibration[0].gps.lon,
        mapCallibration[0].gps.lat,
        mapCallibration[1].gps.lon,
        mapCallibration[1].gps.lat,
        mapCallibration[2].gps.lon,
        mapCallibration[2].gps.lat,
      ]
    ).toArray() as [number, number, number, number, number, number];
  }

  latLongToXY([lat, lon]: [number, number]): [number, number] {
    const x =
      this.latLongToXYCoef[0] * lon +
      this.latLongToXYCoef[2] * lat +
      this.latLongToXYCoef[4];
    const y =
      this.latLongToXYCoef[1] * lon +
      this.latLongToXYCoef[3] * lat +
      this.latLongToXYCoef[5];

    return [x, y];
  }

  xYToLatLong([x, y]: [number, number]): [number, number] {
    const lon =
      this.xYToLatLongCoef[0] * x +
      this.xYToLatLongCoef[2] * y +
      this.xYToLatLongCoef[4];
    const lat =
      this.xYToLatLongCoef[1] * x +
      this.xYToLatLongCoef[3] * y +
      this.xYToLatLongCoef[5];

    return [lat, lon];
  }
}

export function getMapCalibrationFromCalString(
  calstring: string
): MapCalibration {
  const calStringArray = calstring.split("|");

  if (calStringArray.length !== 12)
    throw new Error("Problem with calstring format");

  const [lon1, lat1, x1, y1, lon2, lat2, x2, y2, lon3, lat3, x3, y3] =
    calStringArray.map(parseFloat);

  const calArray = [lon1, lat1, x1, y1, lon2, lat2, x2, y2, lon3, lat3, x3, y3];

  if (calArray.some(isNaN)) throw new Error("Problem with calstring format");

  return [
    {
      gps: { lat: lat1, lon: lon1 },
      point: { x: x1, y: y1 },
    },
    {
      gps: { lat: lat2, lon: lon2 },
      point: { x: x2, y: y2 },
    },
    {
      gps: { lat: lat3, lon: lon3 },
      point: { x: x3, y: y3 },
    },
  ];
}
