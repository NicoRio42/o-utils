export const magnitude = (vector: [number, number]): number => {
  return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
};

export const dotProduct = (
  vector1: [number, number],
  vector2: [number, number]
) => {
  return vector1[0] * vector2[0] + vector1[1] * vector2[1];
};

export const substractVectors = (
  vector1: [number, number],
  vector2: [number, number]
): [number, number] => {
  return [vector1[0] - vector2[0], vector1[1] - vector2[1]];
};

export const distance = (
  vector1: [number, number],
  vector2: [number, number]
): number => {
  return magnitude(substractVectors(vector1, vector2));
};

export function distanceBetweenTwoGPSPoints(
  point1: [number, number],
  point2: [number, number]
) {
  // To radians
  const lat1 = (point1[0] * Math.PI) / 180;
  const lat2 = (point2[0] * Math.PI) / 180;
  const lon1 = (point1[1] * Math.PI) / 180;
  const lon2 = (point2[1] * Math.PI) / 180;

  // Haversine formula
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;

  const a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));

  return c * 6_371_000;
}

export function getLineStringLength(coords: [number, number][]): number {
  return coords.reduce((previous, current, index) => {
    if (index === coords.length - 1) {
      return previous;
    }

    return (
      previous +
      distanceBetweenTwoGPSPoints(
        [current[0], current[1]],
        [coords[index + 1][0], coords[index + 1][1]]
      )
    );
  }, 0);
}
