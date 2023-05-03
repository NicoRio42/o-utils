import type Leg from "../models/leg.js";
import type Routechoice from "../models/routechoice.js";
import type Runner from "../models/runner.js";
import type { RunnerTrack } from "../models/runner.js";
import { isNotNullRunnerLeg } from "../type-guards/runner-guards.js";
import { dotProduct, magnitude } from "../utils/distance-helpers.js";

export function detectRunnersRoutechoices(
  course: Leg[],
  runners: Runner[]
): Runner[] {
  return runners.map((runner) =>
    detectSingleRunnerRoutechoices(course, runner)
  );
}

export function detectSingleRunnerRoutechoices(
  course: Leg[],
  inputRunner: Runner
): Runner {
  if (inputRunner.track === null) return inputRunner;
  checkIfRunnerTrackConsistentWithSplitTimes(inputRunner);
  const runner = structuredClone(inputRunner) as Runner;

  return {
    ...runner,
    legs: runner.legs.map((leg, index) => {
      if (leg === null) {
        return leg;
      }

      const startTime =
        index === 0
          ? runner.startTime
          : runner.startTime + leg.timeOverall - leg.time;

      const finishTime = runner.startTime + leg.timeOverall;

      const runnerLegTrack = prepareRunnerTrackForDetection(
        runner.track as RunnerTrack, // Typescript doesn't mind about my early return
        startTime,
        finishTime,
        runner.timeOffset
      );

      let detectedRouteChoice: Routechoice | null = null;

      if (course[index].routechoices.length !== 0) {
        const d = detectRoutechoice(runnerLegTrack, course[index].routechoices);

        // Because of Firebase nested arrays problème
        detectedRouteChoice = d === null ? null : { ...d, track: [] };
      }

      return {
        ...leg,
        detectedRouteChoice,
      };
    }),
  };
}

function checkIfRunnerTrackConsistentWithSplitTimes(runner: Runner): void {
  if (runner.track === null) throw new Error("Runner doesn't have a track.");
  const length = runner.track.times.length;
  const lastTrackTime = runner.track.times[length - 1];
  if (lastTrackTime === undefined) throw new Error("2DRerun track's is empty.");

  const lastCompleteLeg = structuredClone(runner.legs)
    .reverse()
    .find(isNotNullRunnerLeg);

  if (lastCompleteLeg === undefined)
    throw new Error("Runner have no valid legs.");

  if (runner.track.lats.length !== runner.track.lons.length)
    throw new Error("Lats and lons don't have the same length");
  if (runner.track.lats.length !== runner.track.lons.length)
    throw new Error("Lats and times don't have the same length");
}

const distancePointToSegment = (
  point: [number, number],
  extremity1: [number, number],
  extremity2: [number, number]
): number => {
  let r =
    dotProduct(
      [extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]],
      [point[0] - extremity1[0], point[1] - extremity1[1]]
    ) /
    Math.pow(
      magnitude([extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]]),
      2
    );

  let distance: number;

  if (r < 0) {
    distance = magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]);
  } else if (r > 1) {
    distance = magnitude([extremity2[0] - point[0], extremity2[1] - point[1]]);
  } else {
    distance = Math.sqrt(
      Math.pow(
        magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]),
        2
      ) -
        Math.pow(
          r *
            magnitude([
              extremity2[0] - extremity1[0],
              extremity2[1] - extremity1[1],
            ]),
          2
        )
    );
  }

  return distance;
};

const distancePointToPolyline = (
  point: [number, number],
  polyline: [number, number][]
): number => {
  // Initiallize distance with the distance to the fist point of the polyline
  let distance = magnitude([
    point[0] - polyline[0][0],
    point[1] - polyline[0][1],
  ]);

  for (let i = 1; i < polyline.length; i++) {
    const d = distancePointToSegment(point, polyline[i - 1], polyline[i]);

    if (d < distance) {
      distance = d;
    }
  }

  return distance;
};

const distanceGPXToPolyline = (
  GPXArray: [number, number][],
  polyline: [number, number][]
): number => {
  let distance = 0;

  GPXArray.forEach(
    (point) => (distance += distancePointToPolyline(point, polyline))
  );

  return distance;
};

const detectRoutechoice = (
  runnerLegTrack: [number, number][],
  routechoices: Routechoice[]
): Routechoice | null => {
  if (runnerLegTrack.length === 0) return null;

  // Initiallisation with first routechoice
  let detectedRoutechoice = routechoices[0];
  let distance = distanceGPXToPolyline(runnerLegTrack, routechoices[0].track);

  for (let i = 1; i < routechoices.length; i++) {
    let d = distanceGPXToPolyline(runnerLegTrack, routechoices[i].track);

    if (d < distance) {
      distance = d;
      detectedRoutechoice = routechoices[i];
    }
  }

  return detectedRoutechoice;
};

const prepareRunnerTrackForDetection = (
  runnerTrack: RunnerTrack,
  startTime: number,
  finishTime: number,
  timeOffset: number
): [number, number][] => {
  let startIndex = runnerTrack.times.findIndex(
    (time) => time >= startTime + timeOffset
  );

  let finishIndex = runnerTrack.times.findIndex(
    (time) => time >= finishTime + timeOffset
  );

  if (startIndex === -1 && finishIndex === -1) return [];
  if (startIndex === -1) startIndex = 0;
  if (finishIndex === -1) finishIndex = runnerTrack.times.length - 1;

  return runnerTrack.lats
    .slice(startIndex, finishIndex)
    .map((lat, index) => [lat, runnerTrack.lons[startIndex + index]]);
};
