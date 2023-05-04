import { z } from "zod";

export enum RunnerStatusEnum {
  OK = "ok",
  NOT_OK = "not-ok",
}

export const runnerStatusEnumValidator = z.nativeEnum(RunnerStatusEnum);
