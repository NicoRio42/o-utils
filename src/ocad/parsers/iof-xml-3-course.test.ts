import { describe, expect, test } from "vitest";
import type Control from "../../models/control.js";
import type Leg from "../../models/leg.js";
import parseIOFXML3CourseOCADExport from "./iof-xml-3-course.js";
import { IOF_XML_3_COURSE } from "./mocks/iof-xml-3-course.js";

describe("parseIOFXML3SplitTimesFile()", () => {
  test("throw error when iof xml version is not 3.0.", () => {
    const parser = new DOMParser();
    const xmlDoc3 = parser.parseFromString(IOF_XML_3_COURSE, "text/xml");
    const [controls, legs] = parseIOFXML3CourseOCADExport(xmlDoc3, 0);

    expect(legs).toStrictEqual(expectedLegs);
    expect(controls).toStrictEqual(expectedControls);
  });
});

const expectedLegs: Leg[] = [
  {
    startControlCode: "S1",
    finishControlCode: "31",
    startLat: 45.212847,
    startLon: 5.793802,
    routechoices: [],
  },
  {
    startControlCode: "31",
    finishControlCode: "32",
    startLat: 45.213173,
    startLon: 5.792364,
    routechoices: [],
  },
  {
    startControlCode: "32",
    finishControlCode: "33",
    startLat: 45.212336,
    startLon: 5.78996,
    routechoices: [],
  },
  {
    startControlCode: "33",
    finishControlCode: "34",
    startLat: 45.212446,
    startLon: 5.789548,
    routechoices: [],
  },
  {
    startControlCode: "34",
    finishControlCode: "35",
    startLat: 45.212793,
    startLon: 5.787053,
    routechoices: [],
  },
  {
    startControlCode: "35",
    finishControlCode: "36",
    startLat: 45.213601,
    startLon: 5.787004,
    routechoices: [],
  },
  {
    startControlCode: "36",
    finishControlCode: "37",
    startLat: 45.214257,
    startLon: 5.785209,
    routechoices: [],
  },
  {
    startControlCode: "37",
    finishControlCode: "38",
    startLat: 45.214023,
    startLon: 5.784339,
    routechoices: [],
  },
  {
    startControlCode: "38",
    finishControlCode: "46",
    startLat: 45.213519,
    startLon: 5.785003,
    routechoices: [],
  },
  {
    startControlCode: "46",
    finishControlCode: "39",
    startLat: 45.2133,
    startLon: 5.78612,
    routechoices: [],
  },
  {
    startControlCode: "39",
    finishControlCode: "40",
    startLat: 45.213758,
    startLon: 5.787612,
    routechoices: [],
  },
  {
    startControlCode: "40",
    finishControlCode: "41",
    startLat: 45.21394,
    startLon: 5.78926,
    routechoices: [],
  },
  {
    startControlCode: "41",
    finishControlCode: "42",
    startLat: 45.214394,
    startLon: 5.789118,
    routechoices: [],
  },
  {
    startControlCode: "42",
    finishControlCode: "43",
    startLat: 45.214319,
    startLon: 5.790881,
    routechoices: [],
  },
  {
    startControlCode: "43",
    finishControlCode: "44",
    startLat: 45.213396,
    startLon: 5.790756,
    routechoices: [],
  },
  {
    startControlCode: "44",
    finishControlCode: "45",
    startLat: 45.213072,
    startLon: 5.793086,
    routechoices: [],
  },
  {
    startControlCode: "45",
    finishControlCode: "47",
    startLat: 45.213652,
    startLon: 5.793643,
    routechoices: [],
  },
  {
    startControlCode: "47",
    finishControlCode: "48",
    startLat: 45.21361,
    startLon: 5.795543,
    routechoices: [],
  },
  {
    startControlCode: "48",
    finishControlCode: "49",
    startLat: 45.212894,
    startLon: 5.796382,
    routechoices: [],
  },
  {
    startControlCode: "49",
    finishControlCode: "50",
    startLat: 45.212282,
    startLon: 5.795804,
    routechoices: [],
  },
  {
    startControlCode: "50",
    finishControlCode: "51",
    startLat: 45.21234,
    startLon: 5.796351,
    routechoices: [],
  },
  {
    startControlCode: "51",
    finishControlCode: "52",
    startLat: 45.213149,
    startLon: 5.795548,
    routechoices: [],
  },
  {
    startControlCode: "52",
    finishControlCode: "F1",
    startLat: 45.213071,
    startLon: 5.794389,
    routechoices: [],
  },
];

const expectedControls: Control[] = [
  { code: "S1", lat: 45.212847, lon: 5.793802 },
  { code: "31", lat: 45.213173, lon: 5.792364 },
  { code: "32", lat: 45.212336, lon: 5.78996 },
  { code: "33", lat: 45.212446, lon: 5.789548 },
  { code: "34", lat: 45.212793, lon: 5.787053 },
  { code: "35", lat: 45.213601, lon: 5.787004 },
  { code: "36", lat: 45.214257, lon: 5.785209 },
  { code: "37", lat: 45.214023, lon: 5.784339 },
  { code: "38", lat: 45.213519, lon: 5.785003 },
  { code: "46", lat: 45.2133, lon: 5.78612 },
  { code: "39", lat: 45.213758, lon: 5.787612 },
  { code: "40", lat: 45.21394, lon: 5.78926 },
  { code: "41", lat: 45.214394, lon: 5.789118 },
  { code: "42", lat: 45.214319, lon: 5.790881 },
  { code: "43", lat: 45.213396, lon: 5.790756 },
  { code: "44", lat: 45.213072, lon: 5.793086 },
  { code: "45", lat: 45.213652, lon: 5.793643 },
  { code: "47", lat: 45.21361, lon: 5.795543 },
  { code: "48", lat: 45.212894, lon: 5.796382 },
  { code: "49", lat: 45.212282, lon: 5.795804 },
  { code: "50", lat: 45.21234, lon: 5.796351 },
  { code: "51", lat: 45.213149, lon: 5.795548 },
  { code: "52", lat: 45.213071, lon: 5.794389 },
  { code: "F1", lat: 45.213317, lon: 5.794046 },
];
