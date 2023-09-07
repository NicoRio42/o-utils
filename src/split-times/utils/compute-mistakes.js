import { arrayAverage } from "./shared.js";

/** @typedef {import("../../models/runner.js").Runner} Runner */
/** @typedef {import("../../models/superman.js").SupermanSplit} SupermanSplit */
/** @typedef {import("../../models/runner-leg.js").RunnerLeg} RunnerLeg */

/** 
 * @template T
 * @typedef {import("../models/splittimes-error.model.js").ValueOrError<T>} ValueOrError
 */

/**
 * @param {Runner[]} runners
 * @param {SupermanSplit[]} supermanSplits 
 * @param {number} [mistakeDetectionRatio=1.2] 
 */
export default function computeRunnersMistakes(runners, supermanSplits, mistakeDetectionRatio = 1.2) {
  const clonedRunners = structuredClone(runners);

  clonedRunners.forEach((runner) => {
    const percentagesBehindSuperman = runner.legs.map((leg, legIndex) =>
      leg === null ? null : leg.time / supermanSplits[legIndex].time
    );

    const averagePercentage = arrayAverage(percentagesBehindSuperman);

    const clearedPercentageBehindSuperman =
      clearPercentageBehindAndComputeIsMistake(
        percentagesBehindSuperman,
        runner,
        averagePercentage,
        mistakeDetectionRatio
      );

    // Recalculate average without mistakes
    const clearedAveragePercentage = arrayAverage(
      clearedPercentageBehindSuperman
    );

    const newClearedPercentagesBehindSuperman =
      clearPercentageBehindAndComputeIsMistake(
        percentagesBehindSuperman,
        runner,
        clearedAveragePercentage,
        mistakeDetectionRatio
      );

    // Recalculate average without mistakes
    const newClearedAveragePercentage = arrayAverage(
      newClearedPercentagesBehindSuperman
    );

    let timeLost = 0;

    runner.totalTimeLost = runner.legs.reduce(
      /**
       * @param {number} timeLost 
       * @param {RunnerLeg | null} leg 
       * @param {number} legIndex
       */
      (timeLost, leg, legIndex) => {
        if (leg === null || !leg.isMistake) {
          return 0;
        }

        const timeWithoutMistake = Math.round(
          // First runner is supposed to have only complete legs
          supermanSplits[legIndex].time * newClearedAveragePercentage
        );

        leg.timeLoss = leg.time - timeWithoutMistake;

        return timeLost + leg.timeLoss;
      },
      0
    );
  });

  return clonedRunners;
}

/**
 * @param {(number | null)[]} percentagesBehindSuperman 
 * @param {Runner} runner 
 * @param {number} averagePercentage 
 * @param {number} mistakeDetectionRatio
 */
function clearPercentageBehindAndComputeIsMistake(
  percentagesBehindSuperman,
  runner,
  averagePercentage,
  mistakeDetectionRatio
) {
  return percentagesBehindSuperman.map((percentage, legIndex) => {
    const leg = runner.legs[legIndex];

    if (leg === null || percentage === null) {
      return null;
    }

    leg.isMistake = percentage > averagePercentage * mistakeDetectionRatio;

    return leg.isMistake ? null : percentage;
  });
}
