import type Runner from "../models/runner.js";
import type { RunnerLeg } from "../models/runner-leg.js";

export function isRunner(runner: Runner | null): runner is Runner {
  return runner !== null;
}

export function isNotNullRunnerLeg(
  runnerLeg: RunnerLeg | null
): runnerLeg is RunnerLeg {
  return runnerLeg !== null;
}
