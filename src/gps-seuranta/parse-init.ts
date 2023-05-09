import { Competitor } from "../models/competitor.js";
import { MapCalibration } from "../models/course-map.js";

export function parseGPSSeurantaInitData(
  initData: string
): [MapCalibration, Competitor[]] {
  const trimedLines = initData.split("\n").map((s) => s.trim());

  const callibrationString = trimedLines.find((l) =>
    l.startsWith("CALIBRATION:")
  );

  if (callibrationString === undefined)
    throw new Error("Invalid callibration string in init.txt");

  const callibrationArray = callibrationString
    .slice(12)
    .split("|")
    .map((num, index) => {
      const parsedNumber = parseFloat(num);
      if (isNaN(parsedNumber))
        throw new Error(
          `Invalid callibration string in init.txt. String at index ${index} not a valid number`
        );

      return parsedNumber;
    });

  if (callibrationArray.length !== 12)
    throw new Error(
      "Invalid callibration string in init.txt. Not 12 numbers in the callibration"
    );

  const mapCalibration: MapCalibration = [
    {
      gps: { lon: callibrationArray[0], lat: callibrationArray[1] },
      point: { x: callibrationArray[2], y: callibrationArray[3] },
    },
    {
      gps: { lon: callibrationArray[4], lat: callibrationArray[5] },
      point: { x: callibrationArray[6], y: callibrationArray[7] },
    },
    {
      gps: { lon: callibrationArray[8], lat: callibrationArray[9] },
      point: { x: callibrationArray[10], y: callibrationArray[11] },
    },
  ];

  const competitors: Competitor[] = trimedLines
    .filter((l) => l.startsWith("COMPETITOR:"))
    .map((line) => {
      const rawLine = line.slice(11).split("|");

      if (rawLine.length !== 5) throw new Error("Invalid competitor");

      return { id: rawLine[0], name: rawLine[3] };
    });

  return [mapCalibration, competitors];
}
