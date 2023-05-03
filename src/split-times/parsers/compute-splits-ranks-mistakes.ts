import type Runner from "../../models/runner.js";
import computeRunnersMistakes from "../utils/compute-mistakes.js";
import { computeOverallSplitRanks } from "../utils/compute-overall-split-ranks.js";
import computeRunnersRanks from "../utils/compute-ranks.js";
import { computeSplitRanksAndTimeBehind } from "../utils/compute-split-ranks-time-behind.js";

export default function computeSplitsRanksMistakes(
  runners: Runner[]
): Runner[] {
  const rankedRunners = computeRunnersRanks(runners);

  const [splitRankedRunners, supermanSplits] =
    computeSplitRanksAndTimeBehind(rankedRunners);

  const overallSplitRankedRunners = computeOverallSplitRanks(
    splitRankedRunners,
    supermanSplits
  );

  const runnersWithMistakes = computeRunnersMistakes(
    overallSplitRankedRunners,
    supermanSplits
  );

  return runnersWithMistakes;
}
