import type { MapCalibration } from "../models/course-map.js";
import type { Map } from "../models/loggator-api/logator-event.js";

export const cachedImageElements: Record<string, HTMLImageElement> = {};

export async function getMapCallibrationFromLoggatorEventMap(
  loggatorEventMap: Map
): Promise<MapCalibration> {
  let resolve: Function;
  let reject: Function;

  const promise = new Promise<MapCalibration>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const image = new Image();
  // We cache the image element so openlayers can reuse it when loading the map
  // (it prevents the image from being fetched twice)
  cachedImageElements[loggatorEventMap.url] = image;

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

  return promise;
}
