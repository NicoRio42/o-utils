/** 
 * @template T
 * @typedef {import("../models/splittimes-error.model.js").ValueOrError<T>} ValueOrError
 */

/** @typedef {import("../../models/runner.js").Runner} Runner */
/** @typedef {import("../models/runner-for-sort.model.js").RunnerForSort} RunnerForSort */

/**
 * @param {unknown[]} a 
 * @param {unknown[]} b 
 */
export function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

/**
 * @param {(number | null)[]} a 
 * @returns {number} 
 */
export function arrayAverage(a) {
  let sum = 0;
  let length = 0;

  a.forEach((item) => {
    if (item === null) {
      return;
    }

    sum += item;
    length++;
  });

  return sum / length;
}

/**
 *
 * @param {Element[]} legTags
 * @param {number} index
 * @returns {ValueOrError<string>}
 */
export function getStartControlCode(legTags, index) {
  if (index === 0) return ["start", null];

  const controlCodeTag = legTags[index - 1].querySelector("ControlCode");

  if (controlCodeTag === null || controlCodeTag.textContent === null) {
    return [null, { code: "CONTROL_NOT_FOUND", message: "Previous control sould exist" }]
  }

  return [controlCodeTag.textContent, null];
}

/**
 * Get time in seconds from string with format HH:MM:SS or H:MM:SS or MM:SS or M:SS or SS or S
 * @param {string} str
 * @returns {ValueOrError<number>}
 */
export function parseTimeFromString(str) {
  let seconds = 0, minutes = 0, hours = 0;
  const stringArray = str.split(":");

  if (stringArray.length === 0) {
    return [null, { code: "INVALID_TIME", message: "Time string is invalid" }]
  }

  if (stringArray.length === 1) {
    seconds = parseInt(stringArray[0], 10)
  } else if (stringArray.length === 2) {
    minutes = parseInt(stringArray[0], 10)
    seconds = parseInt(stringArray[1], 10)
  } else if (stringArray.length === 3) {
    hours = parseInt(stringArray[0], 10)
    minutes = parseInt(stringArray[1], 10)
    seconds = parseInt(stringArray[2], 10)
  } else {
    return [null, { code: "INVALID_TIME", message: "Time string is invalid" }]
  }

  if ([hours, minutes, seconds].some(n => isNaN(n))) {
    return [null, { code: "INVALID_TIME", message: "Time string is invalid" }]
  }

  return [hours * 3600 + minutes * 60 + seconds, null]
}

/**
 * @param {Runner | RunnerForSort} runnerA
 * @param {Runner | RunnerForSort} runnerB 
 */
export function sortRunners(runnerA, runnerB) {
  if (runnerA.time !== null && runnerB.time !== null) {
    return runnerA.time - runnerB.time;
  }

  if (runnerA.time === null && runnerB.time !== null) {
    return 1;
  }

  if (runnerA.time !== null && runnerB.time === null) {
    return -1;
  }

  return 0;
}
