import { LoggatorPoints } from "../models/index.js";
import type { LoggatorEvent } from "../models/loggator-api/logator-event.js";
import type { Runner, RunnerTrack } from "../models/runner.js";
import { routesColors } from "../ocad/index.js";

export function buildRunnersTracksFromLoggatorData(
  inputRunners: Runner[],
  points: string,
  loggatorEvent: LoggatorEvent
): Runner[] {
  const runners = structuredClone(inputRunners) as Runner[];
  const pointsMap: Record<
    string,
    { lat: number; lon: number; time: number }[]
  > = {};

  points.split(";").forEach((point) => {
    const [deviceId, ...rest] = point.split(",");

    if (deviceId === undefined || rest.length !== 5)
      throw new Error("Wrong format for loggator points");

    const [lat, lon, elevation, time] = rest.map((str) => {
      const num = parseFloat(str);
      if (isNaN(num)) throw new Error("Wrong format for loggator points");
      return num;
    });

    if (pointsMap[deviceId] === undefined) pointsMap[deviceId] = [];
    pointsMap[deviceId].push({ lat, lon, time });
  });

  runners.forEach((runner) => {
    if (runner.trackingDeviceId === null) return;
    const loggatorDeviceId = runner.trackingDeviceId.split("-")[1];

    if (loggatorDeviceId === undefined)
      throw new Error("Wrong fomat for runner's trackingDeviceId");

    const runnerPoints = pointsMap[loggatorDeviceId];
    if (runnerPoints === undefined) return;

    const runnerInfos = loggatorEvent.competitors.find(
      (competitor) =>
        `loggator-${competitor.device_id}` === runner.trackingDeviceId
    );

    runner.track = {
      lats: [],
      lons: [],
      times: [],
      color: runnerInfos !== undefined ? `#${runnerInfos?.marker_color}` : "",
    };

    for (const point of runnerPoints) {
      runner.track.lats.push(point.lat);
      runner.track.lons.push(point.lon);
      runner.track.times.push(point.time);
    }
  });

  return runners;
}

export function getTracksMapFromLoggatorData(
  loggatorPoints: LoggatorPoints
): Record<string, RunnerTrack> {
  const tracksMap: Record<string, RunnerTrack> = {};
  let trackIndex = 0;

  loggatorPoints.data.split(";").forEach((point) => {
    const [deviceId, ...rest] = point.split(",");

    if (deviceId === undefined || rest.length !== 5)
      throw new Error("Wrong format for loggator points");

    const [lat, lon, elevation, time] = rest.map((str) => {
      const num = parseFloat(str);
      if (isNaN(num)) throw new Error("Wrong format for loggator points");
      return num;
    });

    if (tracksMap[deviceId] === undefined) {
      tracksMap[deviceId] = {
        times: [],
        lats: [],
        lons: [],
        color: routesColors[trackIndex],
      };

      trackIndex++;
    }

    tracksMap[deviceId].lats.push(lat);
    tracksMap[deviceId].times.push(time);
    tracksMap[deviceId].lons.push(lon);
  });

  return tracksMap;
}
