import type { Runner } from "../models/runner.js";
import type { Leg } from "../models/leg.js";

export function createRoutechoiceStatistics(
  runners: Runner[],
  legs: Leg[]
): Leg[] {
  return legs.map((leg, index) =>
    createRoutechoiceStatisticsForOneLeg(leg, index + 1, runners)
  );
}

export function createRoutechoiceStatisticsForOneLeg(
  inputLeg: Leg,
  legNumber: number,
  runners: Runner[]
): Leg {
  const leg = structuredClone(inputLeg) as Leg;

  // Statistics reinit
  leg.routechoices.forEach((rc) => delete rc.statistics);

  runners.forEach((runner) => {
    const runnerLeg = runner.legs[legNumber - 1];
    if (runnerLeg === null || runnerLeg === undefined) return;

    const runnerRoutechoice =
      runnerLeg.manualRouteChoice ?? runnerLeg.detectedRouteChoice ?? null;

    if (runnerRoutechoice === null) return;

    const correspondingRoutechoice = leg.routechoices.find(
      (r) => r.id === runnerRoutechoice.id
    );

    if (correspondingRoutechoice === undefined) {
      console.warn(
        "Can't find runner's attributed routechoice in leg's routechoices list"
      );
      return;
    }

    if (correspondingRoutechoice.statistics === undefined)
      correspondingRoutechoice.statistics = {};

    if (correspondingRoutechoice.statistics.numberOfRunners === undefined)
      correspondingRoutechoice.statistics.numberOfRunners = 0;

    correspondingRoutechoice.statistics.numberOfRunners++;

    if (
      correspondingRoutechoice.statistics.fastestTime === undefined ||
      runnerLeg.time < correspondingRoutechoice.statistics.fastestTime
    )
      correspondingRoutechoice.statistics.fastestTime = runnerLeg.time;
  });

  return leg;
}
