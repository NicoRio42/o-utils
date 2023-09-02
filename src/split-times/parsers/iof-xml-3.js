import { RunnerStatusEnum } from "../../models/enums/runner-status-enum.js";
import { EMPTY_RUNNER_LEG } from "../../models/runner-leg.js";
import { isRunner } from "../../models/type-guards/runner-guards.js";
import { extractNumberFromElementOrThrowError } from "../utils/xml-parser-utils.js";
import { computeSplitsRanksMistakes } from "./compute-splits-ranks-mistakes.js";

/**
 * @typedef {import("../../models/runner.js").Runner} Runner
 */

/**
 * @typedef {import("../../models/runner-leg.js").RunnerLeg} RunnerLeg
 */

/**
 * Parse an IOF XML 3.0 file an return an array of runners of the given class
 * @param {XMLDocument} xmlDocument Returned by new DOMParser().parseFromString("...", "text/xml")
 * Works with linkedom's DOMParser in non browser environment, even if Typescript will
 * complain with the returned type.
 * @param {string} classIdOrName The class id or class name in the xml document
 * @param {string} timeZone A string like "+02:00" representing a timezone offset from GMT
 * @returns {Runner[]}
 */
export function parseIOFXML3SplitTimesFile(
  xmlDocument,
  classIdOrName,
  timeZone
) {
  const IOFXMLVersion = xmlDocument
    .querySelector("ResultList")
    ?.getAttribute("iofVersion");

  if (IOFXMLVersion !== "3.0") {
    throw new Error("Not an IOF XML 3.0 file");
  }

  const classResults = Array.from(xmlDocument.querySelectorAll("ClassResult"));

  let classResult = classResults.find((classR) => {
    const classTag = classR.querySelector("Class");
    const id = classTag?.querySelector("Id")?.textContent?.trim();
    return id === classIdOrName;
  });

  if (classResult === undefined) {
    classResult = classResults.find((classR) => {
      const classTag = classR.querySelector("Class");
      const name = classTag?.querySelector("Name")?.textContent?.trim();
      return name === classIdOrName;
    });
  }

  if (classResult === undefined) {
    throw new Error("There is no ClassResult matching the given class name");
  }

  const personResults = classResult.querySelectorAll("PersonResult");
  const runners = getRunners(personResults, timeZone);

  return computeSplitsRanksMistakes(runners);
}

/**
 *
 * @param {NodeListOf<Element>} personResults
 * @param {string} timeZone
 * @returns {Runner[]}
 */
function getRunners(personResults, timeZone) {
  /** @type {(Runner | null)[]} */
  const rawRunners = Array.from(personResults).map((personResult) => {
    const statusTag = personResult.querySelector("Status");
    const IOFXMLStatus = statusTag !== null ? statusTag.textContent : null;

    // We skip runners with no split at all
    if (IOFXMLStatus === null || !VALID_IOF_XML_STATUS.includes(IOFXMLStatus)) {
      return null;
    }

    const status = OK_IOF_XML_STATUS.includes(IOFXMLStatus)
      ? RunnerStatusEnum.OK
      : RunnerStatusEnum.NOT_OK;

    const id = crypto.randomUUID();

    const family = personResult.querySelector("Family");
    const lastName = family !== null ? family.textContent : "";

    const given = personResult.querySelector("Given");
    const firstName = given !== null ? given.textContent : "";

    const startTimeTag = personResult.querySelector("StartTime");
    const startTime = computeStartTime(startTimeTag, timeZone);

    const timeTag = personResult.querySelector("Time");

    const time =
      status === RunnerStatusEnum.OK
        ? extractNumberFromElementOrThrowError(timeTag, "Not a valid time")
        : null;

    /** @type {(RunnerLeg | null)[]} */
    const legs = extractLegsFromPersonResult(personResult);

    if (legs.length === 0) return null;

    legs.push(computeLastLeg(time, legs));

    return {
      id,
      userId: null,
      trackingDeviceId: null,
      status,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      startTime,
      time,
      legs,
      rank: null,
      timeBehind: null,
      totalTimeLost: 0,
      track: null,
      timeOffset: 0,
    };
  });

  const runners = rawRunners.filter(isRunner);

  if (runners.length === 0) {
    throw new Error("No valid runners in this file");
  }

  const firstRunnerLegsLenth = runners[0].legs.length;

  if (runners.some((runner) => runner.legs.length !== firstRunnerLegsLenth)) {
    throw new Error(
      "Not all runners have the same legs number in their course"
    );
  }

  return runners;
}

/**
 *
 * @param {number | null} time
 * @param {(RunnerLeg | null)[]} legs
 * @returns {RunnerLeg | null}
 */
function computeLastLeg(time, legs) {
  const secondLastLeg = legs.at(-1);

  if (
    time == null ||
    secondLastLeg === null ||
    secondLastLeg?.timeOverall === undefined
  )
    return null;

  const startControlCode = secondLastLeg.finishControlCode;

  return {
    ...EMPTY_RUNNER_LEG,
    startControlCode,
    finishControlCode: "finish",
    timeOverall: time,
    time: time - secondLastLeg.timeOverall,
  };
}

/**
 *
 * @param {Element | null} startTimeTag
 * @param {string} timeZone
 * @returns {number}
 */
function computeStartTime(startTimeTag, timeZone) {
  if (startTimeTag === null || startTimeTag.textContent === null) {
    throw new Error("No start time with a valid runner status");
  }

  const time = startTimeTag.textContent.includes("+")
    ? startTimeTag.textContent
    : startTimeTag.textContent + timeZone;

  const dateTime = new Date(time);

  return dateTime.valueOf() / 1000;
}

/**
 *
 * @param {Element} personResult
 * @returns {(RunnerLeg | null)[]}
 */
function extractLegsFromPersonResult(personResult) {
  const legTags = Array.from(personResult.querySelectorAll("SplitTime"));

  /** @type {(RunnerLeg | null)[]} */
  const legs = [];

  legTags.map((splitTime, index) => {
    const status = splitTime.getAttribute("status");

    if (status === IOFXMLSplitTimeStatusEnum.Additional.valueOf()) return;

    if (status === IOFXMLSplitTimeStatusEnum.Missing.valueOf()) {
      legs.push(null);
      return;
    }

    if (index > 0) {
      const previousControlStatus = legTags[index - 1].getAttribute("status");

      if (
        previousControlStatus ===
        IOFXMLSplitTimeStatusEnum.Additional.valueOf() ||
        previousControlStatus === IOFXMLSplitTimeStatusEnum.Missing.valueOf()
      ) {
        legs.push(null);
        return;
      }
    }

    const startControlCode = getStartControlCode(legTags, index);

    const controlCodeTag = splitTime.querySelector("ControlCode");

    if (controlCodeTag === null || controlCodeTag.textContent === null)
      throw new Error("No control code found for leg finish control");

    const finishControlCode = controlCodeTag.textContent;

    const timeTag = splitTime.querySelector("Time");

    const timeOverall = extractNumberFromElementOrThrowError(
      timeTag,
      "No valid split time"
    );

    const time = getTime(legTags, index, timeOverall);

    legs.push({
      ...EMPTY_RUNNER_LEG,
      startControlCode,
      finishControlCode,
      timeOverall,
      time,
    });
  });

  return legs;
}

/**
 *
 * @param {Element[]} legTags
 * @param {number} index
 * @param {number} timeOverall
 * @returns {number}
 */
function getTime(legTags, index, timeOverall) {
  if (index === 0) return timeOverall;

  const previousControlTimeTag = legTags[index - 1].querySelector("Time");

  const previousControlTimeOverall = extractNumberFromElementOrThrowError(
    previousControlTimeTag,
    "No valid split time"
  );

  return timeOverall - previousControlTimeOverall;
}

/**
 *
 * @param {Element[]} legTags
 * @param {number} index
 * @returns {string}
 */
function getStartControlCode(legTags, index) {
  if (index === 0) return "start";

  const controlCodeTag = legTags[index - 1].querySelector("ControlCode");

  if (controlCodeTag === null || controlCodeTag.textContent === null)
    throw new Error("Previous control sould exist");

  return controlCodeTag.textContent;
}

/** @enum {string} */
const IOFXML3RunnerStatusEnum = {
  OK: "OK",
  Finished: "Finished",
  MissingPunch: "MissingPunch",
  Disqualified: "Disqualified",
  DidNotFinish: "DidNotFinish",
  Active: "Active",
  Inactive: "Inactive",
  OverTime: "OverTime",
  SportingWithdrawal: "SportingWithdrawal",
  NotCompeting: "NotCompeting",
  Moved: "Moved",
  MovedUp: "MovedUp",
  DidNotStart: "DidNotStart",
  DidNotEnter: "DidNotEnter",
  Cancelled: "Cancelled",
};

/** @enum {string} */
const IOFXMLSplitTimeStatusEnum = {
  Missing: "Missing",
  Additional: "Additional",
};

const OK_IOF_XML_STATUS = [
  IOFXML3RunnerStatusEnum.OK,
  IOFXML3RunnerStatusEnum.Finished,
];

const VALID_IOF_XML_STATUS = [
  IOFXML3RunnerStatusEnum.OK,
  IOFXML3RunnerStatusEnum.Finished,
  IOFXML3RunnerStatusEnum.MissingPunch,
  IOFXML3RunnerStatusEnum.Disqualified,
  IOFXML3RunnerStatusEnum.DidNotFinish,
  IOFXML3RunnerStatusEnum.OverTime,
];
