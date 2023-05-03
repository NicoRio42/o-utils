import type Leg from "../../models/leg.js";
import {
  distanceBetweenTwoGPSPoints,
  getLineStringLength,
} from "../../utils/distance-helpers.js";
import { names, routesColors } from "../utils/routechoices-names-colors.js";

export default function parseGPXRoutechoicesOCADExport(
  routechoicesXmlDoc: XMLDocument,
  legs: Leg[]
): Leg[] {
  if (legs.length === 0) return [];

  const clonedLegs = structuredClone(legs) as Leg[];

  const rawRoutechoices: RawRoutechoice[] = Array.from(
    routechoicesXmlDoc.querySelectorAll("trk")
  ).map((trk) => {
    const rawPoints: [number, number][] = Array.from(
      trk.querySelectorAll("trkpt")
    ).map((trkpt) => {
      const latString = trkpt.getAttribute("lat");
      const lonString = trkpt.getAttribute("lon");

      if (latString === null || lonString === null)
        throw new Error("There is no latitude or longitude for this point.");

      const lat = parseFloat(latString);
      const lon = parseFloat(lonString);

      if (isNaN(lat) || isNaN(lon))
        throw new Error(
          "There is a problem with the format of the latitude or the longitude."
        );

      return [lat, lon];
    });

    const pointsString = rawPoints.flat().join("");

    return { rawPoints, pointsString };
  });

  const filteredRawRoutechoices: RawRoutechoice[] = [];

  rawRoutechoices.forEach((rc, i) => {
    if (
      rawRoutechoices
        .slice(0, i)
        .every((route) => route.pointsString !== rc.pointsString)
    )
      filteredRawRoutechoices.push(rc);
  });

  filteredRawRoutechoices.forEach((rc, rcIndex) => {
    const length = getLineStringLength(rc.rawPoints);
    let attributedLegIndex = 0;

    let distanceStart = distanceBetweenTwoGPSPoints(
      [rc.rawPoints[0][0], rc.rawPoints[0][1]],
      [clonedLegs[0].startLat, clonedLegs[0].startLon]
    );

    const rawPointsLength = rc.rawPoints.length;

    let distanceFinish = distanceBetweenTwoGPSPoints(
      [
        rc.rawPoints[rawPointsLength - 1][0],
        rc.rawPoints[rawPointsLength - 1][1],
      ],
      [clonedLegs[0].finishLat, clonedLegs[0].finishLon]
    );

    clonedLegs.forEach((leg, i) => {
      const newDistanceStart = distanceBetweenTwoGPSPoints(
        [rc.rawPoints[0][0], rc.rawPoints[0][1]],
        [leg.startLat, leg.startLon]
      );

      const newDistanceFinish = distanceBetweenTwoGPSPoints(
        [
          rc.rawPoints[rawPointsLength - 1][0],
          rc.rawPoints[rawPointsLength - 1][1],
        ],
        [leg.finishLat, leg.finishLon]
      );

      if (
        newDistanceStart + newDistanceFinish <
        distanceStart + distanceFinish
      ) {
        distanceStart = newDistanceStart;
        distanceFinish = newDistanceFinish;
        attributedLegIndex = i;
      }
    });

    if (distanceStart > 500)
      console.warn(
        "Routechoice first point is more than 500m away from any control"
      );

    clonedLegs[attributedLegIndex].routechoices.push({
      id: crypto.randomUUID(),
      name: "",
      color: "",
      length,
      track: rc.rawPoints,
    });
  });

  return clonedLegs.map((leg) => ({
    ...leg,
    routechoices: leg.routechoices.map((rc, i) => ({
      ...rc,
      name: names[i],
      color: routesColors[i],
    })),
  }));
}

interface RawRoutechoice {
  rawPoints: [number, number][];
  pointsString: string;
}
