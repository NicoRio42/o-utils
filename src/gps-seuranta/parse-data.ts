export function parseGPSSeurantaData(initFile: string, dataFile: string) {
  return handle_gpsseuranta_data(dataFile);
}

function handle_gpsseuranta_data(dataFile: string) {
  return dataFile
    .trim()
    .split("\n")
    .map((s) => s.trim())
    .flatMap(decode_gpsseuranta);
}

const CODE = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function decode_gpsseuranta(dataLine: string) {
  const returnedArray: string[] = [];

  const lineRawArray = dataLine.split(".");
  lineRawArray.pop();

  const id = lineRawArray[0];

  const firstPoint = lineRawArray[1].split("_");

  let time = +firstPoint[0];
  let lat = +firstPoint[1] / 50000;
  let lon = +firstPoint[2] / 100000;

  returnedArray.push(`${id},${time + 1136070000},${lat},${lon}`);

  let V = lon;
  let N = lat;
  let S = time;

  const length = lineRawArray.length;

  for (let i = 2; i < length; i++) {
    if (lineRawArray[i].includes("_")) {
      const Y = lineRawArray[i].split("_");

      time = S + +Y[0];
      lat = N + +Y[1] / 50000;
      lon = V + +Y[2] / 100000;

      returnedArray.push(`${id},${time + 1136070000},${lat},${lon}`);
      break;
    }

    time = S + CODE.indexOf(lineRawArray[i].substring(0, 1)) - 31;
    lat =
      (N * 50000 + CODE.indexOf(lineRawArray[i].substring(1, 2)) - 31) / 50000;
    lon =
      (V * 100000 + CODE.indexOf(lineRawArray[i].substring(2, 3)) - 31) /
      100000;

    returnedArray.push(`${id},${time + 1136070000},${lat},${lon}`);
  }

  return returnedArray;
}
