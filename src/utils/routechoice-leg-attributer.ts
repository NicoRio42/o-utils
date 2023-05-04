import type { Leg } from "../models/leg.js";
import type { Routechoice } from "../models/routechoice.js";
import { distanceBetweenTwoGPSPoints } from "./distance-helpers.js";

export function findRoutechoiceLegIndex(
  routechoice: Routechoice,
  legs: Leg[]
): number {
  let attributedLegIndex = 0;

  let distance = distanceBetweenTwoGPSPoints(
    [routechoice.track[0][0], routechoice.track[0][1]],
    [legs[0].startLat, legs[0].startLon]
  );

  legs.forEach((leg, i) => {
    const newDistance = distanceBetweenTwoGPSPoints(
      [routechoice.track[0][0], routechoice.track[0][1]],
      [leg.startLat, leg.startLon]
    );

    if (newDistance < distance) {
      distance = newDistance;
      attributedLegIndex = i;
    }
  });

  if (distance > 500)
    console.warn(
      "Routechoice first point is more than 500m away from any control"
    );

  return attributedLegIndex;
}
