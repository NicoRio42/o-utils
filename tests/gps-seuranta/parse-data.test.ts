import { describe, test } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { parseGPSSeurantaData } from "../../src/gps-seuranta/parse-data.js";
import { parseGPSSeurantaInitData } from "../../src/gps-seuranta/parse-init.js";

describe("parseGPSSeurantaData()", () => {
  test("Decode GPS seuranta data", () => {
    const data = readFileSync(path.resolve(__dirname, "./data/data.txt"));
    const init = readFileSync(path.resolve(__dirname, "./data/init.txt"));

    const decodedData = parseGPSSeurantaData("", data.toString());
    console.log(decodedData);
    // expect(() =>
    //   parseIOFXML3SplitTimesFile(xmlDoc2, "1", "+02:00", 0)
    // ).toThrow();
  });

  test("Decode GPS seuranta data", () => {
    const init = readFileSync(path.resolve(__dirname, "./data/init.txt"));

    const [mapCalibration, competitors] = parseGPSSeurantaInitData(
      init.toString()
    );
    console.log(mapCalibration, competitors);
    // expect(() =>
    //   parseIOFXML3SplitTimesFile(xmlDoc2, "1", "+02:00", 0)
    // ).toThrow();
  });
});
