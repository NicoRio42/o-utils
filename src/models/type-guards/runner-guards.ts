import type { Runner } from "../runner.js";
import type { RunnerLeg } from "../runner-leg.js";

export function isRunner(runner: Runner | null): runner is Runner {
  return runner !== null;
}

export function isNotNullRunnerLeg(
  runnerLeg: RunnerLeg | null
): runnerLeg is RunnerLeg {
  return runnerLeg !== null;
}
