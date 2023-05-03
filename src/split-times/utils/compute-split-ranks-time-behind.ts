import type Runner from "../../models/runner.js";
import type SupermanSplit from "../../models/superman.js";
import type { RunnerForSort } from "./sort-runners.js";
import sortRunners from "./sort-runners.js";

export function computeSplitRanksAndTimeBehind(
  runners: Runner[]
): [Runner[], SupermanSplit[]] {
  const clonedRunners = structuredClone(runners);
  const course = clonedRunners[0].legs.map((leg) =>
    leg === null ? null : leg.finishControlCode
  );
  const supermanSplits: SupermanSplit[] = [];

  // For every legs of every runners calculate ranking and time behind
  course.forEach((leg, index) => {
    // Make an array with splits and id for one leg
    const legSplits: RunnerForSort[] = clonedRunners.map((runner) => {
      const lg = runner.legs.find((l) => l?.finishControlCode === leg);

      const time = lg === undefined || lg === null ? null : lg.time;
      return { id: runner.id, time, rankSplit: 0 };
    });

    legSplits.sort(sortRunners);
    const bestSplitTime = legSplits[0].time;
    if (bestSplitTime === null) {
      throw new Error("First runner should have a complete race");
    }

    supermanSplits.push({
      time: bestSplitTime,
      timeOverall:
        index === 0
          ? bestSplitTime
          : supermanSplits[index - 1].timeOverall + bestSplitTime,
    });

    legSplits.forEach((legSplit, i) => {
      legSplit.rankSplit =
        i === 0 ? i + 1 : computeRanksplit(legSplit, legSplits[i - 1], i);

      const runner = clonedRunners.find((r) => legSplit.id === r.id);

      if (runner === undefined) {
        throw new Error("Can't find back the leg");
      }

      const runnerLeg = runner.legs[index];

      if (runnerLeg === null) {
        return;
      }

      runnerLeg.rankSplit = legSplit.rankSplit;
      const legBestTime = legSplits[0];

      if (legBestTime.time === null) {
        throw new Error("First Runner should have a split for every legs.");
      }

      runnerLeg.timeBehindSplit = runnerLeg.time - legBestTime.time;
    });
  });

  return [clonedRunners, supermanSplits];
}

export function computeRanksplit(
  legSplit: RunnerForSort,
  previousLegSplit: RunnerForSort,
  index: number
): number {
  if (legSplit.time === previousLegSplit.time) {
    return previousLegSplit.rankSplit;
  }

  return index + 1;
}
