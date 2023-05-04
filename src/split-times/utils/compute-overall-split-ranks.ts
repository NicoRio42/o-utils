import type { Runner } from "../../models/runner.js";
import { computeRanksplit } from "./compute-split-ranks-time-behind.js";
import sortRunners from "./sort-runners.js";
import type { RunnerForSort } from "./sort-runners.js";
import type { SupermanSplit } from "../../models/superman.js";

export function computeOverallSplitRanks(
  runners: Runner[],
  supermanSplits: SupermanSplit[]
): Runner[] {
  const clonedRunners = structuredClone(runners);
  const course = clonedRunners[0].legs.map((leg) => {
    if (leg === null)
      throw new Error("At least one runner sould have a complete course");

    return leg.finishControlCode;
  });

  // For every legs of every runners calculate ranking and time behind
  course.forEach((leg, index) => {
    // Make an array with splits and id for one leg
    const legSplits: RunnerForSort[] = clonedRunners.map((runner) => {
      const lg = runner.legs.find((l) => l?.finishControlCode === leg);

      const time = lg !== null && lg !== undefined ? lg.timeOverall : null;
      return { id: runner.id, time, rankSplit: 0 };
    });

    legSplits.sort(sortRunners);

    legSplits.forEach((legSplit, i) => {
      legSplit.rankSplit =
        i === 0 ? i + 1 : computeRanksplit(legSplit, legSplits[i - 1], i);

      const runner = clonedRunners.find((r) => legSplit.id === r.id);

      if (runner === undefined) {
        throw new Error("Can't find back the runner");
      }

      const runnerLeg = runner.legs[index];

      if (runnerLeg === null) {
        return;
      }

      runnerLeg.rankOverall = legSplit.rankSplit;
      const legOverallBestTime = legSplits[0];

      if (legOverallBestTime.time === null) {
        throw new Error("First Runner should have a split for every legs.");
      }

      runnerLeg.timeBehindOverall =
        runnerLeg.timeOverall - legOverallBestTime.time;

      runnerLeg.timeBehindSuperman =
        runnerLeg.timeOverall - supermanSplits[index].timeOverall;
    });
  });

  return clonedRunners;
}
