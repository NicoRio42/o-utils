export function arrayEquals(a: unknown[], b: unknown[]) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export function arrayAverage(a: (number | null)[]): number {
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
 * @param time in HH:MM:SS format
 * @returns time in seconds
 */
export function timeToSeconds(time: `${string}:${string}:${string}`) {
  const array = time.split(":");
  const length = array.length;
  let seconds = Number(array[length - 1]);

  if (length > 1) {
    seconds += Number(array[length - 2]) * 60;
  }

  if (length > 2) {
    seconds += Number(array[length - 3]) * 3600;
  }

  return seconds;
}
