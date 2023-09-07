
/** @typedef {import("../../models/runner.js").Runner} Runner */
/** @typedef {import("../../models/superman.js").SupermanSplit} SupermanSplit */
/** @typedef {import("../models/runner-for-sort.model.js").RunnerForSort} RunnerForSort */

import { sortRunners } from "./shared.js";

/** 
 * @template T
 * @typedef {import("../models/splittimes-error.model.js").ValueOrError<T>} ValueOrError
 */

/**
 * @param {Runner[]} runners 
 * @returns {ValueOrError<[Runner[], SupermanSplit[]]>}
 */
export function computeSplitRanksAndTimeBehind(runners) {
  const clonedRunners = structuredClone(runners);
  const course = clonedRunners[0].legs.map((leg) =>
    leg === null ? null : leg.finishControlCode
  );

  /** @type {SupermanSplit[]} */
  const supermanSplits = [];

  // For every legs of every runners calculate ranking and time behind
  for (let index = 0; index < course.length; index++) {
    const leg = course[index];

    // Make an array with splits and id for one leg
    /** @type {RunnerForSort[]} */
    const legSplits = clonedRunners.map((runner) => {
      const lg = runner.legs.find((l) => l?.finishControlCode === leg);

      const time = lg === undefined || lg === null ? null : lg.time;
      return { id: runner.id, time, rankSplit: 0 };
    });

    legSplits.sort(sortRunners);
    const bestSplitTime = legSplits[0].time;

    if (bestSplitTime === null) {
      return [null, { code: "FIRST_RUNNER_NOT_COMPLETE", message: "First runner should have a complete course." }]
    }

    supermanSplits.push({
      time: bestSplitTime,
      timeOverall:
        index === 0
          ? bestSplitTime
          : supermanSplits[index - 1].timeOverall + bestSplitTime,
    });

    for (let i = 0; i < legSplits.length; i++) {
      const legSplit = legSplits[i];

      legSplit.rankSplit =
        i === 0 ? i + 1 : computeRanksplit(legSplit, legSplits[i - 1], i);

      const runner = clonedRunners.find((r) => legSplit.id === r.id);

      const runnerLeg = runner?.legs[index];

      if (runnerLeg === null || runnerLeg === undefined) {
        continue;
      }

      runnerLeg.rankSplit = legSplit.rankSplit;
      const legBestTime = legSplits[0];

      if (legBestTime.time === null) {
        return [null, { code: "FIRST_RUNNER_NOT_COMPLETE", message: "First runner should have a complete course." }]
      }

      runnerLeg.timeBehindSplit = runnerLeg.time - legBestTime.time;
    }
  }

  return [[clonedRunners, supermanSplits], null];
}

/**
 * @param {RunnerForSort} legSplit 
 * @param {RunnerForSort} previousLegSplit 
 * @param {number} index 
 */
export function computeRanksplit(legSplit, previousLegSplit, index) {
  if (legSplit.time === previousLegSplit.time) {
    return previousLegSplit.rankSplit;
  }

  return index + 1;
}
