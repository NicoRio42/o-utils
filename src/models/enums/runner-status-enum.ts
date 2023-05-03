import { z } from "zod";

enum RunnerStatusEnum {
  OK = "ok",
  NOT_OK = "not-ok",
}

export const runnerStatusEnumValidator = z.nativeEnum(RunnerStatusEnum);

export default RunnerStatusEnum;
