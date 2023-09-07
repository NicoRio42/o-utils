/** 
 * @template T
 * @typedef {import("../models/splittimes-error.model.js").ValueOrError<T>} ValueOrError
 */

/** @typedef {import("../../models/runner.js").Runner} Runner */

import { parseIOFXML2SplitTimesFile } from "./iof-xml-2-parser.js";
import { parseIOFXML3SplitTimesFile } from "./iof-xml-3-parser.js";

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
export function parseIofXmlSplitTimesFile(
    xmlDocument,
    className,
    timeZone,
    date,
) {
    try {
        const isIofXml3 = xmlDocument
            .querySelector("ResultList")
            ?.getAttribute("iofVersion")?.trim() === "3.0";

        if (isIofXml3) {
            return parseIOFXML3SplitTimesFile(xmlDocument, className, timeZone)
        }

        const isIoxXml2 = xmlDocument
            .querySelector("IOFVersion")
            ?.getAttribute("version")?.trim()?.startsWith("2.");

        if (isIoxXml2) {
            return parseIOFXML2SplitTimesFile(xmlDocument, className, timeZone, date)
        }

        return [null, { code: "INVALID_FORMAT", message: "Invalid Format" }]

    } catch (e) {
        return [null, { code: "UNKNOWN_ERROR", message: "An unknown error occured." }]
    }
}