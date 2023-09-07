import computeRunnersMistakes from "./compute-mistakes.js";
import { computeOverallSplitRanks } from "./compute-overall-split-ranks.js";
import computeRunnersRanks from "./compute-ranks.js";
import { computeSplitRanksAndTimeBehind } from "./compute-split-ranks-time-behind.js";

/** @typedef {import("../../models/runner.js").Runner} Runner */

/**
 * @param {Runner[]} runners
 * @returns {import("../models/splittimes-error.model.js").ValueOrError<Runner[]>}
 */
export function computeSplitsRanksMistakes(runners) {
  const rankedRunners = computeRunnersRanks(runners);
  const [runnersAndSuperman, splitsError] = computeSplitRanksAndTimeBehind(rankedRunners);

  if (splitsError !== null) {
    return [null, splitsError]
  }

  const [splitRankedRunners, supermanSplits] = runnersAndSuperman;

  const [overallSplitRankedRunners, overallSplitRankedRunnersError] = computeOverallSplitRanks(
    splitRankedRunners,
    supermanSplits
  );

  if (overallSplitRankedRunnersError !== null) {
    return [null, overallSplitRankedRunnersError];
  }

  const runnersWithMistakes = computeRunnersMistakes(
    overallSplitRankedRunners,
    supermanSplits
  );

  return [runnersWithMistakes, null];
}
