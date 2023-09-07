import { computeRanksplit } from "./compute-split-ranks-time-behind.js";
import { sortRunners } from "./shared.js";

/** @typedef {import("../../models/runner.js").Runner} Runner */
/** @typedef {import("../../models/superman.js").SupermanSplit} SupermanSplit */
/** @typedef {import("../models/runner-for-sort.model.js").RunnerForSort} RunnerForSort */

/** 
 * @template T
 * @typedef {import("../models/splittimes-error.model.js").ValueOrError<T>} ValueOrError
 */

/**
 * @param {Runner[]} runners
 * @param {SupermanSplit[]} supermanSplits
 * @returns {ValueOrError<Runner[]>}
 */
export function computeOverallSplitRanks(runners, supermanSplits) {
  const clonedRunners = structuredClone(runners);

  /** @type {string[]} */
  const course = []

  for (const leg of clonedRunners[0].legs) {
    if (leg === null) {
      return [null, { code: "FIRST_RUNNER_NOT_COMPLETE", message: "At least one runner sould have a complete course" }]
    }

    course.push(leg.finishControlCode);
  }

  // For every legs of every runners calculate ranking and time behind
  for (let index = 0; index < course.length; index++) {
    const leg = course[index];

    // Make an array with splits and id for one leg
    /** @type {RunnerForSort[]} */
    const legSplits = clonedRunners.map((runner) => {
      const lg = runner.legs.find((l) => l?.finishControlCode === leg);

      const time = lg !== null && lg !== undefined ? lg.timeOverall : null;
      return { id: runner.id, time, rankSplit: 0 };
    });

    legSplits.sort(sortRunners);

    for (let i = 0; i < legSplits.length; i++) {
      const legSplit = legSplits[i];

      legSplit.rankSplit =
        i === 0 ? i + 1 : computeRanksplit(legSplit, legSplits[i - 1], i);

      const runner = clonedRunners.find((r) => legSplit.id === r.id);
      const runnerLeg = runner?.legs[index];

      if (runnerLeg === undefined || runnerLeg === null) {
        continue;
      }

      runnerLeg.rankOverall = legSplit.rankSplit;
      const legOverallBestTime = legSplits[0];

      if (legOverallBestTime.time === null) {
        return [null, { code: "FIRST_RUNNER_NOT_COMPLETE", message: "At least one runner sould have a complete course" }]
      }

      runnerLeg.timeBehindOverall =
        runnerLeg.timeOverall - legOverallBestTime.time;

      runnerLeg.timeBehindSuperman =
        runnerLeg.timeOverall - supermanSplits[index].timeOverall;
    }
  }

  return [clonedRunners, null];
}
