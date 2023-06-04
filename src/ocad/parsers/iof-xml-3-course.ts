import type { Control } from "../../models/control.js";
import type { Leg } from "../../models/leg.js";
import { distanceBetweenTwoGPSPoints } from "../../utils/distance-helpers.js";

export function parseIOFXML3CourseOCADExport(
  courseXmlDoc: XMLDocument,
  classIndex: number
): [Control[], Leg[]] {
  const courseDataTag = courseXmlDoc.querySelector("CourseData");

  if (courseDataTag === null)
    throw new Error("Not a valid IOF XML 3 course file.");

  const iofXMLVersion = courseDataTag.getAttribute("iofVersion");

  if (iofXMLVersion !== "3.0") throw new Error("Not a IOF XML 3 course file.");

  const controlsToCoordsMapper: Record<string, { lat: number; lon: number }> =
    {};

  const RaceCourseDataTag = courseXmlDoc.querySelector("RaceCourseData");

  if (RaceCourseDataTag === null)
    throw new Error("Not a valid IOF XML 3 course file.");

  Array.from(RaceCourseDataTag.children).forEach((control) => {
    if (control.tagName !== "Control") return;

    const positionTag = control.querySelector("Position");

    if (positionTag === null) throw new Error("No position for the control");

    const latString = positionTag.getAttribute("lat");
    const lonString = positionTag.getAttribute("lng");

    if (latString === null || lonString === null)
      throw new Error("No latitude or longitude for this control");

    const lat = parseFloat(latString);
    const lon = parseFloat(lonString);

    if (isNaN(lat) || isNaN(lon))
      throw new Error("Latitude or longitude is not a number");

    const idTag = control.querySelector("Id");

    if (idTag === null || idTag.textContent === null)
      throw new Error("No id for the control");

    controlsToCoordsMapper[idTag.textContent] = {
      lat,
      lon,
    };
  });

  const course = courseXmlDoc.querySelectorAll("Course")[classIndex];

  if (course === undefined)
    throw new Error("No class matching the class index.");

  const controls: Control[] = Array.from(
    course.querySelectorAll("CourseControl")
  ).map((control) => {
    const controlTag = control.querySelector("Control");

    if (controlTag === null)
      throw new Error("No control code for this control");

    const code = controlTag.textContent;

    if (code === null)
      throw new Error("No valid control code for this control");

    const coords = controlsToCoordsMapper[code];

    if (coords === undefined)
      throw new Error(
        "The finish control for this leg was not found in the control list."
      );

    return {
      id: crypto.randomUUID(),
      code,
      lat: coords.lat,
      lon: coords.lon,
    };
  });

  // Remove duplicates
  const filteredcontrols = controls.filter((leg, index) => {
    if (index === 0) return true;

    return (
      distanceBetweenTwoGPSPoints(
        [leg.lat, leg.lon],
        [controls[index - 1].lat, controls[index - 1].lon]
      ) > 20
    );
  });

  const legs: Leg[] = [];

  filteredcontrols.forEach((control, index) => {
    if (index === 0) return;

    legs.push({
      startControlCode: filteredcontrols[index - 1].code,
      finishControlCode: control.code,
      startLat: filteredcontrols[index - 1].lat,
      startLon: filteredcontrols[index - 1].lon,
      finishLat: filteredcontrols[index].lat,
      finishLon: filteredcontrols[index].lon,
      routechoices: [],
    });
  });

  return [filteredcontrols, legs];
}
