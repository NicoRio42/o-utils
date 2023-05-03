import { CoordinatesConverter } from "../map/coords-converter.js";
import type { TwoDRerunCourseExport } from "../models/2d-rerun/course-export.js";
import type { Tag } from "../models/2d-rerun/mapviewer.js";
import type { MapCalibration } from "../models/course-map.js";
import type Leg from "../models/leg.js";
import type Control from "../models/control.js";
import { distanceBetweenTwoGPSPoints } from "../utils/distance-helpers.js";
import type Routechoice from "../models/routechoice.js";
import { findRoutechoiceLegIndex } from "../utils/routechoice-leg-attributer.js";

export default function mapCourseAndRoutechoicesTo2DRerun(
  legs: Leg[],
  course: Control[],
  callibration: MapCalibration
): TwoDRerunCourseExport {
  const coordinatesConverter = new CoordinatesConverter(callibration);

  return {
    tags: legs.flatMap((leg) =>
      formatRoutechoicesForTwoDRerun(leg, coordinatesConverter)
    ),
    coursecoords: course.map((control) => {
      const xyPoint = coordinatesConverter.latLongToXY([
        control.lat,
        control.lon,
      ]);

      return `${xyPoint[0]},${xyPoint[1]}`;
    }),
  };
}

function formatRoutechoicesForTwoDRerun(
  leg: Leg,
  coordinatesConverter: CoordinatesConverter
): Tag[] {
  return leg.routechoices.map((routechoice) => {
    const lastPoint = routechoice.track.at(-1);

    const lastPointXY =
      lastPoint !== undefined
        ? coordinatesConverter.latLongToXY(lastPoint)
        : [0, 0];

    let length = 0;

    const routechoiceTrackLength = routechoice.track.length;

    if (routechoiceTrackLength > 1) {
      for (let i = 1; i < routechoiceTrackLength; i++) {
        length += distanceBetweenTwoGPSPoints(
          routechoice.track[i - 1],
          routechoice.track[i]
        );
      }
    }

    return {
      type: "route",
      opened_dialog: 0,
      ready_for_dialog: 0,
      runnername: "Route",
      points: routechoice.track.map((point) => point.join(",")),
      pointsxy: routechoice.track.map(
        (point, index) =>
          `${coordinatesConverter
            .latLongToXY([point[0], point[1]])
            .join(",")},${index * 3},0`
      ),
      currenttime: 36,
      currentalt: 0,
      totalup: 0,
      show: 1,
      offsettxt_x: 0,
      offsettxt_y: 0,
      offsettxt_basex: 0,
      offsettxt_basey: 0,
      group: 0,
      x: lastPointXY[0],
      y: lastPointXY[1],
      length,
      name: routechoice.name,
      description: "",
      color: routechoice.color,
    };
  });
}

export function parseTwoDRerunCourseAndRoutechoicesExport(
  twoDRerunExport: TwoDRerunCourseExport,
  coordinatesConverter: CoordinatesConverter
): [Control[], Leg[]] {
  const constrolsLength = twoDRerunExport.coursecoords.length;

  const controls = twoDRerunExport.coursecoords.map((coord, index) => {
    let code = index.toString();
    if (index === 0) code = "start";
    if (index === constrolsLength - 1) code = "finish";

    const [x, y] = coord.split(",").map((c) => parseFloat(c));

    if (isNaN(x) || isNaN(y))
      throw new Error("Problem with course coordinates.");

    const [lat, lon] = coordinatesConverter.xYToLatLong([x, y]);

    return {
      code,
      lat,
      lon,
    };
  });

  const legs: Leg[] = [];
  if (constrolsLength === 0) return [controls, legs];

  for (let i = 1; i < constrolsLength; i++) {
    legs.push({
      startControlCode: controls[i - 1].code,
      finishControlCode: controls[i].code,
      startLat: controls[i - 1].lat,
      startLon: controls[i - 1].lon,
      finishLat: controls[i].lat,
      finishLon: controls[i].lon,
      routechoices: [],
    });
  }

  const routechoices: Routechoice[] = twoDRerunExport.tags.map((tag) =>
    map2DRerunTagToRoutechoice(tag, crypto.randomUUID())
  );

  routechoices.forEach((rc) => {
    const legIndex = findRoutechoiceLegIndex(rc, legs);
    legs[legIndex].routechoices.push(rc);
  });

  return [controls, legs];
}

export function map2DRerunTagToRoutechoice(tag: Tag, id: string): Routechoice {
  return {
    id,
    name: tag.name,
    color: `#${tag.color}`,
    length: tag.length,
    track: tag.points.map((point) => {
      const [lat, lon] = point.split(",").map((c) => parseFloat(c));

      if (isNaN(lat) || isNaN(lon))
        throw new Error("Problem with course coordinates.");

      return [lat, lon];
    }),
  };
}
