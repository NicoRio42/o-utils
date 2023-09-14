import { getStartControlCode, parseTimeFromString } from "../utils/shared.js";
import { computeSplitsRanksMistakes } from "../utils/compute-splits-ranks-mistakes.js";
import { EMPTY_RUNNER_LEG } from "../../models/empty-runner-leg.js";

/** @typedef {import("../../models/runner.js").Runner} Runner */
/** @typedef {import("../../models/runner-leg.js").RunnerLeg} RunnerLeg */

/** 
 * @template T
 * @typedef {import("../models/splittimes-error.model.js").ValueOrError<T>} ValueOrError
 */

/**
 * Parse an IOF XML 2.x file an return an array of runners of the given class
 * @param {XMLDocument} xmlDocument Returned by new DOMParser().parseFromString("...", "text/xml")
 * Works with linkedom's DOMParser in non browser environment, even if Typescript will
 * complain with the returned type.
 * @param {string} className The class name in the xml document
 * @param {string} date A date in the YYYY-MM-DD format
 * @param {string} timeZone A string like "+02:00" representing a timezone offset from GMT
 * @returns {ValueOrError<Runner[]>}
 */
export function parseIOFXML2SplitTimesFile(
    xmlDocument,
    className,
    timeZone,
    date,
) {
    try {
        const IOFXMLVersion = xmlDocument
            .querySelector("IOFVersion")
            ?.getAttribute("version");

        if (!IOFXMLVersion?.startsWith("2.")) {
            return [null, { code: "NOT_IOF_XML_2", message: "Not an IOF XML 2 file" }]
        }

        const classResults = Array.from(xmlDocument.querySelectorAll("ClassResult"));

        let classResult = classResults.find((classR) => {
            const classShortName = classR.querySelector("ClassShortName")?.textContent?.trim();
            return classShortName === className;
        });

        if (classResult === undefined) {
            return [null, { code: "CLASS_NAME_NOT_FOUND", message: "There is no ClassResult matching the given class name" }]
        }

        const personResults = classResult.querySelectorAll("PersonResult");
        const [runners, runnerError] = getRunners(personResults, date, timeZone);

        if (runnerError !== null) {
            return [null, runnerError]
        }

        return computeSplitsRanksMistakes(runners);
    } catch (e) {
        return [null, { code: "UNKNOWN_ERROR", message: "An unknown error occured." }]
    }
}

/**
 *
 * @param {NodeListOf<Element>} personResults
 * @param {string} date A date in the YYYY-MM-DD format
 * @param {string} timeZone
 * @returns {ValueOrError<Runner[]>}
 */
function getRunners(personResults, date, timeZone) {
    /** @type {Runner[]} */
    const runners = []

    for (const personResult of Array.from(personResults)) {
        const IOFXMLStatus = personResult.querySelector("CompetitorStatus")?.getAttribute("value")?.trim();

        // We skip runners with no split at all
        if (IOFXMLStatus === undefined || !VALID_IOF_XML_STATUS.includes(IOFXMLStatus)) {
            continue;
        }

        const status = OK_IOF_XML_STATUS.includes(IOFXMLStatus)
            ? "ok"
            : "not-ok";

        const id = crypto.randomUUID();

        const lastName = personResult.querySelector("Person PersonName Family")?.textContent ?? "";
        const firstName = personResult.querySelector("Person PersonName Given")?.textContent ?? "";

        const startTimeTag = personResult.querySelector("Result StartTime Clock");
        const [startTime, startTimeError] = computeStartTime(startTimeTag, date, timeZone);

        if (startTimeError !== null) {
            return [null, startTimeError]
        }

        const timeString = personResult.querySelector("Result Time")?.textContent?.trim();

        if (timeString === undefined) {
            return [null, { code: "INVALID_TIME", message: `Overall time is invalid for runner ${firstName} ${lastName}` }]
        }

        /** @type {number | null} */
        let time = null;

        if (status === "ok") {
            const [parsedTime, timeError] = parseTimeFromString(timeString);

            if (timeError !== null) {
                return [null, { code: "INVALID_TIME", message: `Overall time is invalid for runner ${firstName} ${lastName}` }]
            }

            time = parsedTime;
        }

        const [legs, legsError] = extractLegsFromPersonResult(personResult);

        if (legsError !== null) {
            return [null, legsError];
        }

        if (legs.length === 0) continue;

        legs.push(computeLastLeg(time, legs));

        runners.push({
            id,
            userId: null,
            trackingDeviceId: null,
            status,
            firstName,
            lastName,
            startTime,
            time,
            legs,
            rank: null,
            timeBehind: null,
            totalTimeLost: 0,
            track: null,
            timeOffset: 0,
        })
    }

    if (runners.length === 0) {
        return [null, { code: "NO_VALID_RUNNER", message: "No valid runners in this file" }]
    }

    const firstRunnerLegsLenth = runners[0].legs.length;

    if (runners.some((runner) => runner.legs.length !== firstRunnerLegsLenth)) {
        return [null, { code: "INCONSISTENT_RUNNERS_LEGS", message: "Not all runners have the same legs number in their course" }]
    }

    return [runners, null];
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
 * @param {string} date A date in the YYYY-MM-DD format
 * @param {string} timeZone
 * @returns {ValueOrError<number>}
 */
function computeStartTime(startTimeTag, date, timeZone) {
    if (startTimeTag === null || startTimeTag.textContent === null) {
        return [null, { code: "INVALID_TIME", message: "No start time with a valid runner status" }]
    }

    const time = `${date}T${startTimeTag.textContent.trim()}${timeZone}`
    const dateTime = new Date(time);

    return [dateTime.valueOf() / 1000, null];
}

/**
 *
 * @param {Element} personResult
 * @returns {ValueOrError<(RunnerLeg | null)[]>}
 */
function extractLegsFromPersonResult(personResult) {
    const legTags = Array.from(personResult.querySelectorAll("SplitTime"));

    /** @type {(RunnerLeg | null)[]} */
    const legs = [];

    for (let index = 0; index < legTags.length; index++) {
        const splitTime = legTags[index];

        if (index > 0) {
            const previousControlStatus = legTags[index - 1].getAttribute("status");

            if (
                previousControlStatus ===
                IOFXMLSplitTimeStatusEnum.Additional.valueOf() ||
                previousControlStatus === IOFXMLSplitTimeStatusEnum.Missing.valueOf()
            ) {
                legs.push(null);
                continue;
            }
        }

        const [startControlCode, startControlCodeError] = getStartControlCode(legTags, index);

        if (startControlCodeError !== null) {
            return [null, startControlCodeError]
        }

        const controlCodeTag = splitTime.querySelector("ControlCode");

        if (controlCodeTag === null || controlCodeTag.textContent === null) {
            return [null, { code: "CONTROL_NOT_FOUND", message: "No control code found for leg finish control" }]
        }

        const finishControlCode = controlCodeTag.textContent;

        const timeString = splitTime.querySelector("Time")?.textContent?.trim();

        if (timeString === undefined) {
            return [null, { code: "INVALID_TIME", message: "No valid split time" }]
        }

        const [timeOverall, timeOverallError] = parseTimeFromString(timeString)
        if (timeOverallError !== null) return [null, timeOverallError];

        const [time, timeError] = getTime(legTags, index, timeOverall);
        if (timeError !== null) return [null, timeError];

        legs.push({
            ...EMPTY_RUNNER_LEG,
            startControlCode,
            finishControlCode,
            timeOverall,
            time,
        });
    }

    return [legs, null];
}

/**
 * @param {Element[]} legTags
 * @param {number} index
 * @param {number} timeOverall
 * @returns {ValueOrError<number>}
 */
function getTime(legTags, index, timeOverall) {
    if (index === 0) return [timeOverall, null];

    const previousControlTimeString = legTags[index - 1].querySelector("Time")?.textContent?.trim();

    if (previousControlTimeString === undefined) {
        return [null, { code: "INVALID_TIME", message: "No valid split time" }]
    }

    const [previousControlTimeOverall, timeOverallError] = parseTimeFromString(previousControlTimeString)
    if (timeOverallError !== null) return [null, timeOverallError];

    return [timeOverall - previousControlTimeOverall, null];
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
