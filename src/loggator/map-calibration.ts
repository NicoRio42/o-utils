import type { MapCalibration } from "../models/course-map.js";
import type { Map } from "../models/loggator-api/logator-event.js";

export function getMapCallibrationFromLoggatorEventMap(
  loggatorEventMap: Map
): [Promise<MapCalibration>, HTMLImageElement] {
  let resolve: Function;
  let reject: Function;

  const promise = new Promise<MapCalibration>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const image = new Image();

  image.onload = () => {
    resolve([
      {
        gps: {
          lat: loggatorEventMap.coordinates.topLeft.lat,
          lon: loggatorEventMap.coordinates.topLeft.lng,
        },
        point: { x: 1, y: 1 },
      },
      {
        gps: {
          lat: loggatorEventMap.coordinates.bottomLeft.lat,
          lon: loggatorEventMap.coordinates.bottomLeft.lng,
        },
        point: { x: 1, y: image.naturalHeight },
      },
      {
        gps: {
          lat: loggatorEventMap.coordinates.topRight.lat,
          lon: loggatorEventMap.coordinates.topRight.lng,
        },
        point: { x: image.naturalWidth, y: 1 },
      },
    ]);
  };

  image.onerror = () => reject("Failed to load map image");
  image.src = loggatorEventMap.url;

  return [promise, image];
}
